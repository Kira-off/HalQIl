from django.contrib import admin
from .models import ProviderProfile, ProviderSkill, ProviderDistrict, ProviderSchedule, ProviderApplication

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'availability_status', 'reliability', 'successful_orders', 'failed_orders')
    list_filter = ('availability_status',)
    search_fields = ('user__email',)

@admin.register(ProviderSkill)
class ProviderSkillAdmin(admin.ModelAdmin):
    list_display = ('provider', 'skill', 'service_type', 'experience_years')
    list_filter = ('service_type', 'skill')
    search_fields = ('provider__user__email',)

@admin.register(ProviderDistrict)
class ProviderDistrictAdmin(admin.ModelAdmin):
    list_display = ('provider', 'district_name')
    search_fields = ('provider__user__email', 'district_name')

@admin.register(ProviderSchedule)
class ProviderScheduleAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day_of_week', 'open_time', 'close_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')

@admin.register(ProviderApplication)
class ProviderApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__email',)
