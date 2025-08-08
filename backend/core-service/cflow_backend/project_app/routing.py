efrom django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'exec/<int:folder_id>/$', consumers.ExecConsumer.as_asgi())
]