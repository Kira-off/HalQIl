from django.db import models
from django.conf import settings
from apps.providers.models import ProviderProfile
from apps.catalog.models import Skill

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Kutilmoqda'
        ACCEPTED = 'ACCEPTED', 'Qabul qilindi'
        CHATTING = 'CHATTING', 'Chat'
        REJECTED = 'REJECTED', 'Rad etildi'
        IN_PROGRESS = 'IN_PROGRESS', 'Jarayonda'
        AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION', 'Tasdiqlash kutilmoqda'
        COMPLETED = 'COMPLETED', 'Yakunlandi'
        FAILED = 'FAILED', 'Muvaffaqiyatsiz'
        DISPUTED = 'DISPUTED', 'Shikoyat'
        CANCELLED = 'CANCELLED', 'Bekor qilindi'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING
    )
    description = models.TextField()
    address = models.CharField(max_length=300)
    preferred_date = models.DateTimeField(null=True, blank=True)
    is_successful = models.BooleanField(null=True, blank=True)
    auto_completed = models.BooleanField(default=False)
    awaiting_confirm_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} — {self.status}"

class Review(models.Model):
    class FromRole(models.TextChoices):
        USER = 'USER', 'Foydalanuvchi'
        PROVIDER = 'PROVIDER', 'Provayder'

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True)
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    from_role = models.CharField(max_length=20, choices=FromRole.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating}★ by {self.reviewer.email}"
