from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserRoleView,
    AdminUserFreezeView,
    AdminUserBlockView,
    AdminUserDeleteView,
    AdminApplicationListView,
    AdminApplicationDetailView,
    AdminApplicationApproveView,
    AdminApplicationRejectView,
    AdminCategoryListView,
    AdminCategoryCreateView,
    AdminCategoryToggleView,
    AdminSkillCreateView,
    AdminSkillToggleView,
    AdminBroadcastView,
    AdminDisputedOrderListView,
    AdminResolveDisputeView
)

urlpatterns = [
    # Users Management
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<uuid:pk>/role/', AdminUserRoleView.as_view(), name='admin-user-role'),
    path('users/<uuid:pk>/freeze/', AdminUserFreezeView.as_view(), name='admin-user-freeze'),
    path('users/<uuid:pk>/block/', AdminUserBlockView.as_view(), name='admin-user-block'),
    path('users/<uuid:pk>/', AdminUserDeleteView.as_view(), name='admin-user-delete'),

    # Provider Applications
    path('applications/', AdminApplicationListView.as_view(), name='admin-applications-list'),
    path('applications/<int:pk>/', AdminApplicationDetailView.as_view(), name='admin-application-detail'),
    path('applications/<int:pk>/approve/', AdminApplicationApproveView.as_view(), name='admin-application-approve'),
    path('applications/<int:pk>/reject/', AdminApplicationRejectView.as_view(), name='admin-application-reject'),

    # Categories & Skills
    path('categories/', AdminCategoryListView.as_view(), name='admin-categories-list'),
    path('categories/create/', AdminCategoryCreateView.as_view(), name='admin-category-create'),
    path('categories/<int:pk>/toggle/', AdminCategoryToggleView.as_view(), name='admin-category-toggle'),
    path('skills/create/', AdminSkillCreateView.as_view(), name='admin-skill-create'),
    path('skills/<int:pk>/toggle/', AdminSkillToggleView.as_view(), name='admin-skill-toggle'),

    # Broadcast Notifications
    path('notifications/broadcast/', AdminBroadcastView.as_view(), name='admin-broadcast'),

    # Disputes Resolution
    path('orders/disputed/', AdminDisputedOrderListView.as_view(), name='admin-disputed-orders'),
    path('orders/<int:pk>/resolve/', AdminResolveDisputeView.as_view(), name='admin-resolve-dispute'),
]
