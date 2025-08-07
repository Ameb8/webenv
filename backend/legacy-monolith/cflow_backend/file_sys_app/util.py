import os
import tempfile
import shutil
from contextlib import contextmanager
from typing import Generator

from file_sys_app.models import File, Folder


def load_folder_to_temp(folder: Folder) -> str:
    temp_dir: str = tempfile.mkdtemp()

    for file in folder.files.all():
        file_name: str = f"{file.file_name}{file.extension or ''}"
        file_path: str = os.path.join(temp_dir, file_name)

        with open(file_path, 'w', encoding='utf-8') as temp_file:
            temp_file.write(file.file_content or '')

    return temp_dir

def cleanup_temp_dir(path: str) -> None:
    shutil.rmtree(path)

@contextmanager
def save_to_temp(folder: Folder) -> Generator[str, None, None]:
    path: str = load_folder_to_temp(folder)

    try:
        yield path
    finally:
        cleanup_temp_dir(path)


