from django.urls import path
from .views import RegisterView, MeView, LogoutView, UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
]
