from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    OrderCancelView,
    OrderAcceptView,
    OrderRejectView,
    OrderFinishView,
    OrderConfirmView,
    OrderMessagesView
)

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('orders/<int:pk>/accept/', OrderAcceptView.as_view(), name='order-accept'),
    path('orders/<int:pk>/reject/', OrderRejectView.as_view(), name='order-reject'),
    path('orders/<int:pk>/finish/', OrderFinishView.as_view(), name='order-finish'),
    path('orders/<int:pk>/confirm/', OrderConfirmView.as_view(), name='order-confirm'),
    path('orders/<int:pk>/messages/', OrderMessagesView.as_view(), name='order-messages'),
]
