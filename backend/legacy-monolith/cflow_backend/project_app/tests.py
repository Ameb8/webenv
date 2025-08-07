from django.urls import reverse
from rest_framework import status
from project_app.models import Project
from test.base import TestSetup, USERNAME

class ProjectCreationTest(TestSetup):
    def test_create_project(self):
        url = reverse('create_project')
        data = {
            'root': self.root_folder.id,
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Project.objects.filter(user=self.user, root=self.root_folder).exists())

