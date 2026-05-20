from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.accounts.views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.providers.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.organizations.urls')),
    path('api/admin/', include('apps.admin_panel.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)