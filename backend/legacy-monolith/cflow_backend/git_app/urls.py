from django.urls import path
from .views import RepoViews

urlpatterns = [
    path('repos/', RepoViews.as_view(), name='repo'),

]