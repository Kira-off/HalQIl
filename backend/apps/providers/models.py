from django.db import models
from django.conf import settings
from apps.catalog.models import Skill

class ProviderProfile(models.Model):
    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Bo\'sh'
        BUSY = 'BUSY', 'Band'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_profile'
    )
    bio = models.TextField(blank=True)
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE
    )
    reliability = models.FloatField(default=100.0)
    successful_orders = models.IntegerField(default=0)
    failed_orders = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Provider: {self.user.email}"

class ProviderSkill(models.Model):
    class ServiceType(models.TextChoices):
        REMOTE = 'REMOTE', 'Masofaviy'
        ONSITE = 'ONSITE', 'Joyida'
        BOTH = 'BOTH', 'Ikkalasi ham'

    provider = models.ForeignKey(
        ProviderProfile, on_delete=models.CASCADE, related_name='skills'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    service_type = models.CharField(
        max_length=20, choices=ServiceType.choices, default=ServiceType.BOTH
    )
    experience_years = models.IntegerField(default=0)
    price_from = models.DecimalField(max_digits=10, decimal_places=2)
    price_to = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.provider} — {self.skill.name}"

class ProviderDistrict(models.Model):
    provider = models.ForeignKey(
        ProviderProfile, on_delete=models.CASCADE, related_name='districts'
    )
    district_name = models.CharField(max_length=100)

    def __str__(self):
        return self.district_name

class ProviderSchedule(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 1, 'Dushanba'
        TUESDAY = 2, 'Seshanba'
        WEDNESDAY = 3, 'Chorshanba'
        THURSDAY = 4, 'Payshanba'
        FRIDAY = 5, 'Juma'
        SATURDAY = 6, 'Shanba'
        SUNDAY = 7, 'Yakshanba'

    provider = models.ForeignKey(
        ProviderProfile, on_delete=models.CASCADE, related_name='schedule'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.provider} — {self.get_day_of_week_display()}"

class ProviderApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Kutilmoqda'
        APPROVED = 'APPROVED', 'Tasdiqlandi'
        REJECTED = 'REJECTED', 'Rad etildi'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_applications'
    )
    about_me = models.TextField()
    why_join = models.TextField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    rejection_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} — {self.status}"
