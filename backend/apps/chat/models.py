from django.db import models
from django.conf import settings
from apps.orders.models import Order

class Message(models.Model):
    class MessageType(models.TextChoices):
        TEXT = 'TEXT', 'Matn'
        IMAGE = 'IMAGE', 'Rasm'
        FILE = 'FILE', 'Fayl'

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField()
    type = models.CharField(
        max_length=10, choices=MessageType.choices, default=MessageType.TEXT
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.email}"

class AdminChat(models.Model):
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_chats'
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_chats'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AdminChat: {self.admin.email} ↔ {self.target_user.email}"

class AdminChatMessage(models.Model):
    chat = models.ForeignKey(
        AdminChat, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AdminMsg from {self.sender.email}"
