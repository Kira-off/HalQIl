from django.contrib import admin
from .models import Order, Review

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'provider', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'provider__user__email')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('order', 'reviewer', 'reviewee', 'rating', 'from_role', 'created_at')
    list_filter = ('from_role', 'rating')
    search_fields = ('reviewer__email', 'reviewee__email')
