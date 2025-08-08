from django.db import models
from django.conf import settings
from django.utils import timezone
from file_sys_app.models import Folder


class Project(models.Model):
    # ForeignKey to file model
    root = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name='projects'
    )

    # Foreign key to user model
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.CASCADE,
        related_name='projects'  # optional, but recommended
    )

    # Executable file
    exec_file = models.BinaryField(null=True, blank=True)

    # Time of most recent compilation and update
    compiled_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('root', 'user')


