import json
from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.catalog.serializers import SkillSerializer
from apps.catalog.models import Skill
from .models import ProviderProfile, ProviderSkill, ProviderDistrict, ProviderSchedule, ProviderApplication

class ProviderSkillSerializer(serializers.ModelSerializer):
    skill_details = SkillSerializer(source='skill', read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True), source='skill', write_only=True
    )

    class Meta:
        model = ProviderSkill
        fields = ['id', 'skill', 'skill_details', 'skill_id', 'service_type', 'experience_years', 'price_from', 'price_to', 'description']
        read_only_fields = ['id', 'skill']

class ProviderDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderDistrict
        fields = ['id', 'district_name']

class ProviderScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderSchedule
        fields = ['id', 'day_of_week', 'open_time', 'close_time', 'is_active']

class ProviderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = ProviderSkillSerializer(many=True, read_only=True)
    districts = ProviderDistrictSerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        fields = ['id', 'user', 'bio', 'availability_status', 'reliability', 'successful_orders', 'failed_orders', 'skills', 'districts']
        read_only_fields = ['id', 'user', 'reliability', 'successful_orders', 'failed_orders']

class ProviderApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    districts = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = ProviderApplication
        fields = ['id', 'user', 'about_me', 'why_join', 'status', 'rejection_note', 'districts', 'skills', 'created_at', 'updated_at']

    def get_districts(self, obj):
        parts = obj.why_join.split("\n---APPLICATION_DATA---\n")
        if len(parts) > 1:
            try:
                data = json.loads(parts[1])
                return data.get('districts', [])
            except Exception:
                pass
        return []

    def get_skills(self, obj):
        parts = obj.why_join.split("\n---APPLICATION_DATA---\n")
        if len(parts) > 1:
            try:
                data = json.loads(parts[1])
                return data.get('skills', [])
            except Exception:
                pass
        return []

class ProviderApplicationCreateSerializer(serializers.ModelSerializer):
    districts = serializers.ListField(child=serializers.CharField(), write_only=True)
    skills = serializers.ListField(child=serializers.JSONField(), write_only=True)

    class Meta:
        model = ProviderApplication
        fields = ['about_me', 'why_join', 'districts', 'skills']

    def create(self, validated_data):
        districts = validated_data.pop('districts', [])
        skills = validated_data.pop('skills', [])
        
        why_join_text = validated_data.get('why_join', '')
        data_payload = {'districts': districts, 'skills': skills}
        validated_data['why_join'] = f"{why_join_text}\n---APPLICATION_DATA---\n{json.dumps(data_payload)}"
        
        user = self.context['request'].user
        return ProviderApplication.objects.create(user=user, **validated_data)
