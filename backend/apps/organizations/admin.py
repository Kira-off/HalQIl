from django.contrib import admin
from .models import Organization, OrganizationMember

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'admin_provider', 'rating', 'reliability', 'created_at')
    search_fields = ('name', 'admin_provider__user__email')

@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'organization', 'provider', 'status', 'joined_at')
    list_filter = ('status',)
    search_fields = ('organization__name', 'provider__user__email')
