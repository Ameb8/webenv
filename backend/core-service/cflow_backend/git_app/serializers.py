from rest_framework import serializers
from .models import Repository

class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = [
            'id',
            'user',
            'folder',
            'github_repo_id',
            'github_owner',
            'github_name',
            'default_branch',
            'last_synced_at',
            'is_private',
            'clone_url',
        ]
        read_only_fields = fields