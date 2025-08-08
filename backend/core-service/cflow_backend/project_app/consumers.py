from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
import docker
from asgiref.sync import sync_to_async
from folder_sys_app.models import Folder
from build_manager.docker_util import compile_folder

docker_client = docker.from_env()

def exec_code(exec_path):
    container = docker_client.containers.run(
        image="gcc:latest",
        command=f"./{exec_path}",
        stdin_open=True,
        stdout=True,
        stderr=True,
        tty=True,
        detach=True,
        remove=True,
        cpuset_cpus="0",
        mem_limit="256m",
        pids_limit=64,
        network_disabled=True,
        working_dir="/code",
        volumes={
            "/host/path/to/executables": {
                'bind': '/code',
                'mode': 'rw'
            }
        }
    )
    socket = container.attach_socket(params={
        'stdin': 1,
        'stdout': 1,
        'stderr': 1,
        'stream': 1
    })
    socket._sock.setblocking(False)

    return container, socket

class ExecConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept() # Wait for connection acceptance

        try: # Get folder to compile
            self.folder_id = self.scope['url_route']['kwargs']['folder_id']
            self.folder = await sync_to_async(Folder.objects.get)(id=self.folder_id)
        except Folder.DoesNotExist: # Folder ID invalid
            await self.send(text_data=json.dumps({'error': "Project not found"}))
            await self.close()
            return

        # Compile if updated since last compile
        if self.folder.last_compiled_at < self.folder.last_modified_at:
            stdout, stderr, exec_file = await asyncio.to_thread(compile_folder, self.folder)

            if exec_file is None: # Source code cannot be compiled
                await self.send(text_data=json.dumps({
                    'error': f"Code could not be compiled.\n\n{stderr}"
                }))
                await self.close()
                return
        else:
            exec_file = self.folder.exec_file

        try:
            self.container, self.socket = await asyncio.to_thread(exec_code, exec_file)
        except Exception as e:
            await self.send(text_data=json.dumps({'error': f"Failed to start container: {str(e)}"}))
            await self.close()
            return

        # Create output reading task
        self.read_task = asyncio.create_task(self.read_output())

    async def disconnect(self, close_code):
        if hasattr(self, 'read_task'):
            self.read_task.cancel()
        if hasattr(self, 'container'):
            try:
                await asyncio.to_thread(self.container.kill)
            except Exception:
                pass

    async def receive(self, text_data):
        # Prevent sending after process exit
        if not self.container or not self.container.attrs or self.container.attrs.get("State", {}).get("Running") is False:
            await self.send(text_data=json.dumps({'error': 'Program has already exited.'}))
            await self.close()
            return

        try:
            input_data = (text_data + "\n").encode()
            await asyncio.to_thread(self.socket._sock.send, input_data)
        except (BrokenPipeError, OSError) as e:
            await self.send(text_data=json.dumps({'error': f"Send failed: {str(e)}"}))
            await self.close()


    async def read_output(self):
        try:
            while True:
                try:
                    data = await asyncio.to_thread(self.socket._sock.recv, 4096)
                    if not data:
                        break
                    await self.send(text_data=json.dumps({'output': data.decode()}))
                except BlockingIOError:
                    await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            await self.send(text_data=json.dumps({'error': f'Reading output failed: {str(e)}'}))
        finally:
            await self.close()
