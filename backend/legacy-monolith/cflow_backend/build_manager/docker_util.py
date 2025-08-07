import docker
import subprocess
import tempfile
import io
import tarfile
import os
import uuid
from file_sys_app.models import Folder, File

CONTAINER_ROOT_PATH = "/deploy"
OUTPUT_BINARY_PATH = "/deploy/a.out"

container_name = f"cflow-{uuid.uuid4()}"
client = docker.from_env()

def get_container():
    try: # Attempt to create secure container
        container = client.containers.run(
            image="gcc:latest",
            command="/bin/bash",
            name=container_name,
            detach=True,
            tty=True,
            stdin_open=True,
            remove=True,
            cpuset_cpus="0",
            mem_limit="256m",
            pids_limit=64,
            network_disabled=True
        )
        return container # Creation success
    except docker.errors.DockerException as e: # Creation failed
        raise RuntimeError("Failed to start Docker container") from e


def container_move_file(container, folder_path, file):
    try:
        file_name = file.file_name
        if file.extension:
            file_name += f".{file.extension}"

        # Create temporary file
        with tempfile.NamedTemporaryFile("w", delete=False) as tmpf:
            tmpf.write(file.file_content or "")
            tmp_file_path = tmpf.name

        container_file_path = os.path.join(folder_path, file_name)

        tar_stream = make_tar_bytes(container_file_path, tmp_file_path)
        container.put_archive(folder_path, tar_stream)
    except docker.errors.DockerException as e: # File transfer failed
        raise RuntimeError("Failed to transfer user files to Docker") from e
    finally: # Remove files from host
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


def make_tar_bytes(container_path, host_path):
    tarstream = io.BytesIO() # Instantiate Tar file
    try:  # Convert file to Tar
        with tarfile.open(fileobj=tarstream, mode="w") as tar:
            tar.add(name=host_path, arcname=os.path.basename(container_path))
    except (tarfile.TarError, OSError) as e: # Conversion failed
        raise RuntimeError(f"Failed to create tar archive from {host_path}") from e

    tarstream.seek(0)
    return tarstream


def container_move_folder(container, folder, container_path):
    current_container_path = os.path.join(container_path, folder.folder_name) # Get current path

    try: # Create directory inside container
        exit_code, output = container.exec_run(f"mkdir -p {current_container_path}")
        if exit_code != 0: # Creation failed
            raise RuntimeError(f"Failed to create directory {current_container_path} in container: {output.decode()}")
    except docker.errors.DockerException as e: # Error occured
        raise RuntimeError(f"Docker exec failed for mkdir in container: {e}") from e

    # Move all files of this folder into container path
    for file in folder.files.all():
        container_move_file(container, current_container_path, file)

    # Recursively process subfolders
    for subfolder in folder.subfolders.all():
        container_move_folder(container, subfolder, current_container_path)


def compile_folder(folder):
    container = None
    try:
        container = get_container() # Start container

        # Move folder to container
        container_move_folder(container, folder, CONTAINER_ROOT_PATH)

        # Create compilation command
        compile_cmd = (
            f"gcc $(find {CONTAINER_ROOT_PATH} -name '*.c') "
            f"$(find {CONTAINER_ROOT_PATH} -type d | xargs -I{{}} echo -I{{}}) "
            f"-o {OUTPUT_BINARY_PATH}"
        )

        # Compile folder as project
        exit_code, output = container.exec_run(f"bash -c '{compile_cmd}'", demux=True)

        # Save container output
        stdout = output[0].decode() if output[0] else ""
        stderr = output[1].decode() if output[1] else ""

        if exit_code != 0: # Compilation failed — no executable to return
            return stdout, stderr, None

        # Fetch compiled executable as tar archive bytes
        bits, stat = container.get_archive(OUTPUT_BINARY_PATH)
        file_bytes = b"".join(bits)

        return stdout, stderr, file_bytes

    finally:
        if container:
            try:
                container.kill()
            except Exception:
                pass

