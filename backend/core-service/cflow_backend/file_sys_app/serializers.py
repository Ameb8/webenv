from rest_framework import serializers
from drf_polymorphic.serializers import PolymorphicSerializer
from .models import Folder, File, BinFile, TextFile, FileTreeObj

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'user', 'folder_name', 'parent']
        read_only_fields = ['user']
        exclude = ['exec_file, last_modified_at', 'last_compiled_at']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file_name', 'folder', 'created_at', 'last_modified_at', 'extension', 'file_content']

'''
class FileNameOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file_name', 'extension']

class FolderTreeSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()
    files = FileNameOnlySerializer(many=True)

    class Meta:
        model = Folder
        fields = ['id', 'folder_name', 'subfolders', 'files']

    def get_subfolders(self, obj):
        return FolderTreeSerializer(obj.subfolders.all(), many=True).data
'''


class FileChangeInputSerializer(serializers.Serializer):
    change_type = serializers.ChoiceField(choices=['insert', 'delete'])
    position = serializers.IntegerField()
    text = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    length = serializers.IntegerField(required=False, allow_null=True)

'''
class FileTreeSerializer(PolymorphicSerializer):
    pass


class FolderSumSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'children']

    def get_children(self, obj):
        return []


class FileSumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'extension']


# Mapping for polymorphic file tree serializer
FileTreeSerializer.serializer_mapping = {
    Folder: FolderSumSerializer,
    File: FileSumSerializer,
}

# Patch children to use the now-resolved FileTreeSerializer
FolderSumSerializer._declared_fields['children'] = FileTreeSerializer(many=True, read_only=True)

'''


'''
class FileTreeSerializer(PolymorphicSerializer):
    # resource_type_field_name = 'object_type'
    serializer_mapping = {}

    object_type = serializers.SerializerMethodField()

    def get_object_type(self, obj):
        if isinstance(obj, Folder):
            return "folder"
        elif isinstance(obj, TextFile):
            return "textfile"
        elif isinstance(obj, BinFile):
            return "binfile"
        return "file"

    def _get_resource_type_from_instance(self, instance):
        if isinstance(instance, Folder):
            return "folder"
        elif isinstance(instance, TextFile):
            return "textfile"
        elif isinstance(instance, BinFile):
            return "binfile"
        print(f"Unknown type for polymorphic serializer: {type(instance)}")

class FolderSumSerializer(serializers.ModelSerializer):
    object_type = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'children', 'object_type']

    def get_object_type(self, obj):
        return "folder"

    def get_children(self, obj):
        serializer = FileTreeSerializer(obj.children, many=True, context=self.context)
        return serializer.data



    def get_children(self, obj):
        children_qs = obj.children.all()
        serializer = FileTreeSerializer(children_qs, many=True, context=self.context)
        return serializer.data


class FileSumSerializer(serializers.ModelSerializer):
    object_type = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'name', 'extension', 'object_type']

    def get_object_type(self, obj):
        if isinstance(obj, TextFile):
            return "textfile"
        elif isinstance(obj, BinFile):
            return "binfile"
        print(f"Unknown type for polymorphic serializer: {type(obj)}")

FileTreeSerializer.serializer_mapping = {
    'folder': FolderSumSerializer,
    'textfile': FileSumSerializer,
    'binfile': FileSumSerializer,
}
'''


class FileTreeObjSerializer(serializers.ModelSerializer):
    object_type = serializers.SerializerMethodField()

    class Meta:
        model = FileTreeObj  # abstract base — only used for field inheritance
        fields = ['id', 'name', 'object_type']

    def get_object_type(self, obj):
        return obj.__class__.__name__

class FolderNameSerializer(FileTreeObjSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = FileTreeObjSerializer.Meta.fields + ['children']

    def get_children(self, obj):
        return FileTreePolymorphicSerializer(obj.children, many=True).data

class TextFileNameSerializer(FileTreeObjSerializer):
    class Meta:
        model = TextFile
        fields = FileTreeObjSerializer.Meta.fields + ['extension']


class BinFileNameSerializer(FileTreeObjSerializer):
    class Meta:
        model = BinFile
        fields = FileTreeObjSerializer.Meta.fields + ['extension', 'is_executable']


class FileTreePolymorphicSerializer(PolymorphicSerializer):
    serializer_mapping = {
        'Folder': FolderNameSerializer,
        'TextFile': TextFileNameSerializer,
        'BinFile': BinFileNameSerializer,
    }

    resource_type_field_name = 'object_type'

    object_type = serializers.SerializerMethodField()

    def get_object_type(self, obj):
        return obj.__class__.__name__


