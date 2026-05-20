from django.urls import path
from .views import (
    OrganizationListView,
    OrganizationDetailView,
    OrganizationCreateView,
    OrganizationJoinView
)

urlpatterns = [
    path('organizations/', OrganizationListView.as_view(), name='organization-list'),
    path('organizations/<int:pk>/', OrganizationDetailView.as_view(), name='organization-detail'),
    path('provider/organization/apply-create/', OrganizationCreateView.as_view(), name='organization-create'),
    path('provider/organization/apply-join/', OrganizationJoinView.as_view(), name='organization-join'),
]
