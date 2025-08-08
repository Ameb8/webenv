from rest_framework import serializers
from project_app.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'user', 'root', 'exec_file']
        read_only_fields = ['user']
