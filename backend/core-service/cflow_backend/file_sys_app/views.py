from typing import Generator, Optional, List, Dict, Any, Union, Optional

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.serializers import Serializer
from rest_framework import status
from django.utils import timezone

from build_manager.docker_util import compile_folder
from .models import TextFile, Folder, FileTreeObj
from .serializers import FileSerializer, FolderSerializer, FileTreePolymorphicSerializer #,FolderSumSerializer


class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer: Serializer) -> None:
        serializer.save(user=self.request.user)


class TextFileViewSet(viewsets.ModelViewSet):
    queryset = TextFile.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_filesystem(request: Request) -> Response:
    user = request.user
    root_folders = Folder.objects.filter(user=user, parent=None)
    serializer = FolderSumSerializer(root_folders, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_file_tree(request: Request, root_id: Optional[str] = None) -> Response:
    root: Optional[Folder] = None # Root folder in response
    user = request.user

    if root_id: # Get provided root folder
        try: # Attempt to query database
            root = Folder.objects.get(id=root_id, user=user)
        except Folder.DoesNotExist: # Provided ID does not exist
            return Response({"error": "Folder not found."}, status=404)
    else: # Get user's root folder
        try: # Attempt to get root folder
            root = Folder.objects.get(user=user, parent=None)
        except Folder.DoesNotExist: # Error, root folder doesn't exist
            return Response({"error": "User has no root folder."}, status=404)

    serializer = FileTreePolymorphicSerializer(root, context={'request': request})
    return Response(serializer.data)

'''
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_project(request: Request, folder_id: int) -> Response:
    user = request.user
    try:
        root_folder: Folder = Folder.objects.get(id=folder_id, user=user)
    except Folder.DoesNotExist:
        return Response({"error": "Folder not found."}, status=404)

    serializer = FolderTreeSerializer(root_folder)
    return Response(serializer.data)

'''
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def build_folder(request: Request, folder_id: int) -> Response:
    try:  # Get folder by id
        folder: Folder = Folder.objects.get(id=folder_id, user=request.user)
    except Folder.DoesNotExist:  # Folder not found
        return Response({"error": "Folder not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

    # Compile folder as project in container
    stdout, stderr, exec_file = compile_folder(folder)

    # Compilation failed, return errors
    if stderr and "error" in stderr.lower():
        return Response({
            "stdout": stdout,
            "stderr": stderr,
            "message": "Compilation failed."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Update folder executable file
    folder.exec_file = exec_file
    folder.last_compiled_at = timezone.now()

    # Compilation successful, return results
    return Response({
        "stdout": stdout,
        "stderr": stderr,
        "message": "Compilation succeeded.",
    }, status=status.HTTP_200_OK)


# views.py
from .models import File, FileChange
from .serializers import FileChangeInputSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_file_changes(request: Request, file_id: int) -> Response:
    try:
        file: TextFile = TextFile.objects.get(id=file_id, folder__user=request.user)
    except TextFile.DoesNotExist:
        return Response({"error": "File not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

    # Validate incoming list of changes
    changes_data: List[Dict[str, Any]] = request.data.get('changes', [])
    serializer = FileChangeInputSerializer(data=changes_data, many=True)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes in order
    changes = serializer.validated_data
    content: str = file.file_content or ""

    for change in changes:
        pos: int = change['position']
        if change['change_type'] == 'insert': # Insert text
            text: str = change.get('text') or ''
            content = content[:pos] + text + content[pos:]
        elif change['change_type'] == 'delete': # Remove text
            length: int = change.get('length') or 0
            content = content[:pos] + content[pos + length:]

    # Save updated file content
    file.file_content = content
    file.save()

    return Response({
        "message": "File updated successfully.",
        "updated_content": content
    }, status=status.HTTP_200_OK)

