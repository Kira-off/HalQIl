from django.db import models
from django.conf import settings
from apps.providers.models import ProviderProfile

class Organization(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='organizations/', blank=True, null=True)
    admin_provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name='owned_organizations'
    )
    rating = models.FloatField(default=0.0)
    reliability = models.FloatField(default=100.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class OrganizationMember(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Kutilmoqda'
        APPROVED = 'APPROVED', 'Tasdiqlandi'
        REJECTED = 'REJECTED', 'Rad etildi'

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='members'
    )
    provider = models.ForeignKey(
        ProviderProfile, on_delete=models.CASCADE, related_name='organizations'
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider} in {self.organization}"
