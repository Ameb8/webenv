import os
import tempfile
import zipfile
import requests
import json

from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from file_sys_app.models import Folder
from .models import Repository
from .serializers import RepositorySerializer
from .git_util import (
    get_github_token,
    save_repo,
)


class RepoViews(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        token = get_github_token(user)

        if not token:
            return Response({"error": "GitHub token not found"}, status=400)

        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }

        # GitHub API to get user repos
        url = "https://api.github.com/user/repos"

        params = {
            "per_page": 100,  # Max per page
            "sort": "updated"
        }

        try:
            r = requests.get(url, headers=headers, params=params)
            r.raise_for_status()
        except requests.RequestException as e:
            return Response({"error": f"GitHub API error: {str(e)}"}, status=502)

        repos = r.json()

        # Format repository list
        repo_list = [
            {
                "id": repo["id"],
                "name": repo["name"],
                "full_name": repo["full_name"],
                "private": repo["private"],
                "html_url": repo["html_url"],
                "description": repo.get("description"),
            }
            for repo in repos
        ]

        return Response(repo_list)


    def post(self, request):
        folder_id = request.data.get("folder_id")
        repo_url = request.data.get("repo_url")

        if not folder_id or not repo_url:
            return Response(
                {"error": "Both 'folder_id' and 'repo_url' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            folder = Folder.objects.get(id=folder_id, user=request.user)
        except Folder.DoesNotExist:
            return Response(
                {"error": "Folder not found or doesn't belong to the user."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Extract owner and repo name from URL (e.g., https://github.com/octocat/hello-world)
        try:
            path_parts = repo_url.replace("https://github.com/", "").rstrip("/").split("/")
            github_owner, github_name = path_parts[0], path_parts[1]
        except Exception:
            return Response({"error": "Invalid GitHub repo URL format."}, status=400)

        # Get GitHub token
        token = get_github_token(request.user)
        if not token:
            return Response(
                {"error": "No GitHub token found for user."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Fetch repo metadata from GitHub API
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }

        github_api_url = f"https://api.github.com/repos/{github_owner}/{github_name}"
        response = requests.get(github_api_url, headers=headers)

        if response.status_code != 200:
            return Response(
                {"error": f"Failed to fetch repo from GitHub. ({response.status_code})"},
                status=status.HTTP_400_BAD_REQUEST
            )

        repo_data = response.json()

        # Create Repository instance
        try:
            repository = Repository.objects.create(
                user=request.user,
                folder=folder,
                github_repo_id=str(repo_data["id"]),
                github_owner=repo_data["owner"]["login"],
                github_name=repo_data["name"],
                default_branch=repo_data["default_branch"],
                last_synced_at=timezone.now(),
                is_private=repo_data["private"],
                clone_url=repo_data["clone_url"]
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        save_repo(repository)

        serializer = RepositorySerializer(repository)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



