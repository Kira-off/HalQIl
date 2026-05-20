from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'role', 'status', 'is_online', 'wallet_id')
    list_filter = ('role', 'status', 'is_online')
    search_fields = ('email', 'username', 'wallet_id')
    ordering = ('email',)
