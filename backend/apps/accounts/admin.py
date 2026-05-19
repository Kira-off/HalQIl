from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'status', 'is_online')
    list_filter = ('role', 'status', 'is_online')
    search_fields = ('email', 'first_name', 'last_name', 'username', 'wallet_id')
    readonly_fields = ('id', 'wallet_id', 'created_at', 'updated_at')
