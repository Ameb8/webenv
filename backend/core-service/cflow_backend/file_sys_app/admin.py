from django.contrib import admin
from .models import Folder, TextFile, BinFile

admin.site.register(Folder)
admin.site.register(TextFile)
admin.site.register(BinFile)