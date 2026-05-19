from django.contrib import admin
from .models import Message, AdminChat, AdminChatMessage

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'sender', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('sender__email', 'order__id')

@admin.register(AdminChat)
class AdminChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin', 'target_user', 'created_at')
    search_fields = ('admin__email', 'target_user__email')

@admin.register(AdminChatMessage)
class AdminChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'created_at')
    search_fields = ('sender__email',)
