import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from utils.helpers import generate_wallet_id

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'SUPER_ADMIN')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    class Role(models.TextChoices):
        USER = 'USER', 'Foydalanuvchi'
        PROVIDER = 'PROVIDER', 'Provayder'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Faol'
        FROZEN = 'FROZEN', 'Muzlatilgan'
        BLOCKED = 'BLOCKED', 'Bloklangan'
        DELETED = 'DELETED', 'O\'chirilgan'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet_id = models.CharField(max_length=10, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'email']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.wallet_id:
            self.wallet_id = generate_wallet_id()
        super().save(*args, **kwargs)

    @property
    def is_staff(self):
        return self.role == 'SUPER_ADMIN'

    @property
    def is_superuser(self):
        return self.role == 'SUPER_ADMIN'

    def has_perm(self, perm, obj=None):
        return self.role == 'SUPER_ADMIN'

    def has_module_perms(self, app_label):
        return self.role == 'SUPER_ADMIN'

    class Meta:
        verbose_name = 'Foydalanuvchi'
        verbose_name_plural = 'Foydalanuvchilar'

    def __str__(self):
        return f"{self.email} ({self.role})"
