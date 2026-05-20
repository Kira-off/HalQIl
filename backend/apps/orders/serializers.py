from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.providers.serializers import ProviderProfileSerializer
from apps.catalog.serializers import SkillSerializer
from apps.catalog.models import Skill
from apps.providers.models import ProviderProfile
from apps.chat.models import Message
from .models import Order, Review

class OrderCreateSerializer(serializers.ModelSerializer):
    provider = serializers.PrimaryKeyRelatedField(queryset=ProviderProfile.objects.all())
    skill = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all())

    class Meta:
        model = Order
        fields = ['provider', 'skill', 'description', 'address', 'preferred_date']

class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'provider', 'skill', 'status', 'description', 
            'address', 'preferred_date', 'is_successful', 'auto_completed', 
            'awaiting_confirm_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'is_successful', 'auto_completed', 'awaiting_confirm_at', 'created_at', 'updated_at']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'order', 'reviewer', 'reviewee', 'skill', 'rating', 'comment', 'from_role', 'created_at']
        read_only_fields = ['id', 'reviewer', 'reviewee', 'skill', 'from_role', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'order', 'sender', 'content', 'type', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']
