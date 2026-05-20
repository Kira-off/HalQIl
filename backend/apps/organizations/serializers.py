from rest_framework import serializers
from apps.providers.serializers import ProviderProfileSerializer
from .models import Organization, OrganizationMember

class OrganizationSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    admin_provider = ProviderProfileSerializer(read_only=True)

    class Meta:
        model = Organization
        fields = ['id', 'name', 'description', 'logo', 'admin_provider', 'rating', 'reliability', 'members_count', 'created_at']

    def get_members_count(self, obj):
        # Only count approved members (plus the admin provider)
        return obj.members.filter(status=OrganizationMember.Status.APPROVED).count() + 1

class OrganizationMemberSerializer(serializers.ModelSerializer):
    provider = ProviderProfileSerializer(read_only=True)
    organization_details = OrganizationSerializer(source='organization', read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ['id', 'organization', 'organization_details', 'provider', 'status', 'joined_at']
        read_only_fields = ['id', 'provider', 'status', 'joined_at']
