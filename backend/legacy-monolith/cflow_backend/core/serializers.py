
from django.contrib.auth.models import User
from rest_framework import serializers

class CompileCCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=5000)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']