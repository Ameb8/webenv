from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from file_sys_app.serializers import FileTreePolymorphicSerializer, FileSerializer
from .models import Project
from file_sys_app.models import Folder, File
from build_manager.docker_util import compile_folder
from .serializer import ProjectSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        project = serializer.save(user=request.user)
        return Response({"id": project.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def  build_project(request, project_id):
    try: # Get project by id
        project = Project.objects.get(id=project_id, user=request.user)
    except Project.DoesNotExist: # project not found
        return Response({"error": "Project not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

    # Compile project
    stdout, stderr, executable_bytes = compile_folder(project.root)

    # Compilation failed, return errors
    if stderr and "error" in stderr.lower():
        return Response({
            "stdout": stdout,
            "stderr": stderr,
            "message": "Compilation failed."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Update project's binary file and compilation timestamp
    project.exec_file = executable_bytes
    project.compiled_at = timezone.now()
    project.save()

    return Response({
        "stdout": stdout,
        "stderr": stderr,
        "message": "Compilation succeeded.",
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id, user=request.user)
    except Project.DoesNotExist:
        return Response({'detail': 'Project not found.'}, status=404)

    root_folder = project.root
    serializer = FileTreeSerializer(root_folder)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_file(request, project_id):
    serializer = FileSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
