# auth_app/urls.py
from django.urls import path, include
from .views import current_user, custom_login, custom_logout, register, get_csrf

urlpatterns = [
    path('', include('allauth.urls')),
    path('user/', current_user, name='current_user'),
    path('login/', custom_login, name='login'),
    path('logout/', custom_logout, name='logout'),
    path('register/', register, name='register'),
    path('csrf/', get_csrf, name='get_csrf'),
]
