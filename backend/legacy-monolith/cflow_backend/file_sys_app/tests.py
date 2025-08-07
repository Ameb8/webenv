from django.test import TestCase
from django.urls import reverse
from rest_framework import status
import json
from file_sys_app.models import Folder
from file_sys_app.serializers import FolderTreeSerializer
from test.base import TestSetup, USERNAME, PASSWORD

class FolderTest(TestSetup):
    '''
    ProjectCreationTest Correct Response:

    [
        {
            "id": 7,
            "folder_name": "test_user",
            "subfolders": [
                {
                    "id": 8,
                    "folder_name": "subfolder",
                    "subfolders": [],
                    "files": [
                        {
                            "id": 2,
                            "file_name": "hello_world",
                            "extension": "c"
                        },
                        {
                            "id": 3,
                            "file_name": "hello_world",
                            "extension": "h"
                        }
                    ]
                }
            ],
            "files": [
                {
                    "id": 1,
                    "file_name": "main",
                    "extension": "c"
                }
            ]
        }
    ]

    '''

    def test_get_user_filesystem(self):
        url = reverse('get_user_filesystem') # Get endpoint url

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        #
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)

        expected_data = FolderTreeSerializer(Folder.objects.filter(user=self.user, parent=None), many=True).data
        self.assertEqual(response.json(), expected_data)

    def test_get_user_filesystem_unauthenticated(self):
        self.client.logout()
        url = reverse('get_user_filesystem')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.client.login(user=USERNAME, password=PASSWORD)

    def test_folder_tree_serializer(self):
        serializer = FolderTreeSerializer(self.root_folder)
        data = serializer.data

        # You can assert key parts of the structure like this:
        self.assertEqual(data['folder_name'], 'test_user')
        self.assertEqual(len(data['files']), 1)
        self.assertEqual(data['files'][0]['file_name'], 'main')
        self.assertEqual(data['files'][0]['extension'], 'c')

        self.assertEqual(len(data['subfolders']), 1)
        subfolder = data['subfolders'][0]
        self.assertEqual(subfolder['folder_name'], 'subfolder')
        self.assertEqual(len(subfolder['files']), 2)

        file_names = {f['file_name'] + '.' + f['extension'] for f in subfolder['files']}
        self.assertSetEqual(file_names, {'hello_world.c', 'hello_world.h'})

        # Ensure subfolder has no sub-subfolders
        self.assertEqual(subfolder['subfolders'], [])

    def test_build_folder(self):
        print("Test build folder running")
        url = reverse("build_folder", args=[self.root_folder.id])
        response = self.client.post(url)
        print(response.json())