"""
ASGI config for cflow_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# your_project_name/asgi.py

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import project.routing  # <-- your app's routing.py with websocket routes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cflow_backend.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            project.routing.websocket_urlpatterns
        )
    ),
})
