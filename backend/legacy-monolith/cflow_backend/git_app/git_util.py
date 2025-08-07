import os
import tempfile
import zipfile
import requests
import os
import datetime
from contextlib import contextmanager


from git import Repo, GitCommandError

from django.utils.timezone import now
from allauth.socialaccount.models import SocialToken, SocialAccount

from file_sys_app.models import File, Folder
from .models import Repository


def get_github_token(user):
    try:
        account = SocialAccount.objects.get(user=user, provider='github')
        token = SocialToken.objects.get(account=account)

        # DEBUG *******
        print(f"\n\nAccount: {account}")
        print(f"Token: {token}\n\n")
        # END DEBUG ***

        return token.token
    except (SocialAccount.DoesNotExist, SocialToken.DoesNotExist):
        return None


def clone_repo(repository: Repository) -> tempfile.TemporaryDirectory:
    user = repository.user
    token = get_github_token(user)

    if not token:
        raise Exception("GitHub token not found for user.")

    # Inject token into clone URL (HTTPS URL)
    secure_url = repository.clone_url.replace(
        "https://", f"https://{token}@"
    )

    try:
        temp_dir = tempfile.TemporaryDirectory()
        Repo.clone_from(
            secure_url,
            temp_dir.name,
            branch=repository.default_branch,
            depth=1 
        )
        print(f"Repo cloned to temp dir: {temp_dir.name}")
        return temp_dir  # caller is responsible for calling temp_dir.cleanup()
    except GitCommandError as e:
        raise Exception(f"Failed to clone repo: {e}")
    

def save_repo(repository: Repository):
    temp_dir = clone_repo(repository)
    try:
        root_clone_path = temp_dir.name
        user = repository.user
        root_folder = repository.folder  # Root folder already exists and is linked

        def walk_and_store(current_path, parent_folder):
            for entry in os.listdir(current_path):
                full_path = os.path.join(current_path, entry)

                if os.path.isdir(full_path):
                    # Create subfolder
                    subfolder = Folder.objects.create(
                        folder_name=entry,
                        user=user,
                        parent=parent_folder
                    )
                    walk_and_store(full_path, subfolder)

                elif os.path.isfile(full_path):
                    file_name, extension = os.path.splitext(entry)
                    extension = extension[1:] if extension.startswith(".") else extension

                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        content = None  # binary file, skip or flag if needed

                    File.objects.create(
                        file_name=file_name,
                        extension=extension,
                        folder=parent_folder,
                        file_content=content
                    )

        # Start walking from the root of the cloned repo into root_folder
        walk_and_store(root_clone_path, root_folder)

        # Optional: update sync timestamp
        repository.last_synced_at = now()
        repository.save()

    finally:
        temp_dir.cleanup()



