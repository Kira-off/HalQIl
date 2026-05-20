from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'sender', 'title', 'message', 'type', 'is_read', 'is_global', 'link', 'created_at']
