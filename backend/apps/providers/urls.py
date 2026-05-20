from django.urls import path
from .views import (
    ProviderListView,
    ProviderDetailView,
    ProviderApplicationView,
    MyApplicationView,
    MyProviderProfileView,
    ProviderScheduleView,
    ProviderSkillView
)

urlpatterns = [
    path('providers/', ProviderListView.as_view(), name='provider-list'),
    path('providers/<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
    path('provider/apply/', ProviderApplicationView.as_view(), name='provider-apply'),
    path('provider/my-application/', MyApplicationView.as_view(), name='my-application'),
    path('provider/profile/', MyProviderProfileView.as_view(), name='my-profile'),
    path('provider/schedule/', ProviderScheduleView.as_view(), name='my-schedule'),
    path('provider/skills/', ProviderSkillView.as_view(), name='my-skills'),
]
