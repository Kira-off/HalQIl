from django.db import models
from django.conf import settings

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ANNOUNCEMENT = 'ANNOUNCEMENT', 'E\'lon'
        NEWS = 'NEWS', 'Yangilik'
        WARNING = 'WARNING', 'Ogohlantirish'
        APPLICATION_RESPONSE = 'APPLICATION_RESPONSE', 'Ariza javobi'
        SYSTEM = 'SYSTEM', 'Tizim'
        DIRECT_MESSAGE = 'DIRECT_MESSAGE', 'Xabar'
        NEW_ORDER = 'NEW_ORDER', 'Yangi buyurtma'
        CONFIRMATION_REQUEST = 'CONFIRMATION_REQUEST', 'Tasdiqlash'
        DISPUTE = 'DISPUTE', 'Shikoyat'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(
        max_length=30, choices=NotificationType.choices, default=NotificationType.SYSTEM
    )
    is_read = models.BooleanField(default=False)
    is_global = models.BooleanField(default=False)
    link = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type}: {self.title}"
