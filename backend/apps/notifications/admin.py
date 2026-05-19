from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'type', 'is_read', 'is_global', 'created_at')
    list_filter = ('type', 'is_read', 'is_global', 'created_at')
    search_fields = ('title', 'user__email')
