from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.conf import settings
from .models import Folder

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_folder(sender, instance, created, **kwargs):
    if created:
        Folder.objects.create(
            user=instance,
            name=instance.username,
            parent=None
        )
