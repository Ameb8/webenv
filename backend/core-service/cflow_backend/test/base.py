from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.test import TestCase
from file_sys_app.models import Folder, File
from project_app.models import Project

USERNAME = 'test_user'
PASSWORD = 'password'

MAIN_CONTENT = """\
#include <stdio.h>
#include "hello_world.h"

int main() {
    hello_world();
    return 0;
}
"""

HW_CONTENT = """\
#include <stdio.h>
#include "hello_world.h"

void hello_world() {
    printf("Hello, World!\\n");
}
"""

HW_H_CONTENT = """\
#ifndef HELLO_WORLD_H
#define HELLO_WORLD_H

void hello_world();

#endif
"""

User = get_user_model()

class TestSetup(APITestCase):
    def setUp(self):
        # Create logged in test user
        self.user = User.objects.create_user(username=USERNAME, password=PASSWORD)
        self.client.login(username=USERNAME, password=PASSWORD)

        # Get automatically created root folder for user
        self.root_folder = Folder.objects.get(user=self.user, folder_name='test_user', parent=None)

        # Create subfolder
        self.subfolder = Folder.objects.create(folder_name='subfolder', user=self.user, parent=self.root_folder)

        # Create files
        File.objects.create(file_name='main', folder=self.root_folder, extension='c', file_content=MAIN_CONTENT)
        File.objects.create(file_name='hello_world', folder=self.subfolder, extension='c', file_content=HW_CONTENT)
        File.objects.create(file_name='hello_world', folder=self.subfolder, extension='h', file_content=HW_H_CONTENT)