from django.urls import path
from .views import build_project, create_project, get_project

urlpatterns = [
    path('projects/<int:project_id>/deploy/', build_project, name='deploy_project'),
    path('projects/create/', create_project, name='create_project'),
    path('project/<int:project_id>/filesystem/', get_project, name='get_project_filesystem'),
]