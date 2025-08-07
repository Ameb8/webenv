from django.urls import path, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('compile/', views.compile_c_code, name='compile_c_code'),
    path('login/', views.custom_login, name='custom_login')
]