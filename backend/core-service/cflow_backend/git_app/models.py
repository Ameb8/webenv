from django.db import models
from django.conf import settings
from file_sys_app.models import File, Folder

class Repository(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='repositories'
    )
    folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name='repository'
    )
    github_repo_id = models.CharField(max_length=100, unique=True)
    github_owner = models.CharField(max_length=100)
    github_name = models.CharField(max_length=100)
    default_branch = models.CharField(max_length=100, default='main')
    last_synced_at = models.DateTimeField(null=True, blank=True)
    is_private = models.BooleanField(default=True)
    clone_url = models.URLField()

    class Meta:
        unique_together = ('user', 'github_repo_id')