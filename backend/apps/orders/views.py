from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsProvider, IsUser
from utils.helpers import calculate_reliability
from apps.notifications.views import send_notification
from apps.chat.models import Message
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, MessageSerializer

from rest_framework.generics import ListCreateAPIView, RetrieveAPIView

class OrderListCreateView(ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            if hasattr(user, 'provider_profile'):
                return Order.objects.filter(provider=user.provider_profile).order_by('-created_at')
            return Order.objects.none()
        return Order.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user, status=Order.Status.PENDING)
        # Notify provider
        send_notification(
            user=order.provider.user,
            title="Yangi buyurtma",
            message=f"Sizda yangi buyurtma bor. Buyurtma #{order.id}",
            type="NEW_ORDER",
            link=f"/orders/{order.id}"
        )


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            if hasattr(user, 'provider_profile'):
                return Order.objects.filter(provider=user.provider_profile)
            return Order.objects.none()
        return Order.objects.filter(user=user)

class OrderCancelView(APIView):
    permission_classes = [IsUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi yoki sizga tegishli emas.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response({'error': 'Faqat kutilayotgan (PENDING) buyurtmalarni bekor qilish mumkin.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.CANCELLED
        order.save()

        # Notify provider
        send_notification(
            user=order.provider.user,
            title="Buyurtma bekor qilindi",
            message=f"Buyurtma #{order.id} buyurtmachi tomonidan bekor qilindi.",
            type="SYSTEM",
            link=f"/orders/{order.id}"
        )
        return Response(OrderSerializer(order).data)

class OrderAcceptView(APIView):
    permission_classes = [IsProvider]

    def patch(self, request, pk):
        provider_profile = request.user.provider_profile
        try:
            order = Order.objects.get(pk=pk, provider=provider_profile)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi yoki sizga tegishli emas.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response({'error': 'Faqat kutilayotgan (PENDING) buyurtmalarni qabul qilish mumkin.'}, status=status.HTTP_400_BAD_REQUEST)

        message_content = request.data.get('message', 'Buyurtma qabul qilindi.')

        order.status = Order.Status.ACCEPTED
        order.save()

        # Add message to chat from provider
        Message.objects.create(
            order=order,
            sender=request.user,
            content=message_content,
            type=Message.MessageType.TEXT
        )

        # Notify user
        send_notification(
            user=order.user,
            title="Buyurtma qabul qilindi",
            message=f"Provayder buyurtmangizni qabul qildi. Buyurtma #{order.id}",
            type="SYSTEM",
            link=f"/orders/{order.id}"
        )
        return Response(OrderSerializer(order).data)

class OrderRejectView(APIView):
    permission_classes = [IsProvider]

    def patch(self, request, pk):
        provider_profile = request.user.provider_profile
        try:
            order = Order.objects.get(pk=pk, provider=provider_profile)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi yoki sizga tegishli emas.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response({'error': 'Faqat kutilayotgan (PENDING) buyurtmalarni rad etish mumkin.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', 'Sababi ko\'rsatilmadi.')

        order.status = Order.Status.REJECTED
        order.save()

        # Notify user
        send_notification(
            user=order.user,
            title="Buyurtma rad etildi",
            message=f"Provayder buyurtmangizni rad etdi. Sababi: {reason}",
            type="SYSTEM",
            link=f"/orders/{order.id}"
        )
        return Response(OrderSerializer(order).data)

class OrderFinishView(APIView):
    permission_classes = [IsProvider]

    def patch(self, request, pk):
        provider_profile = request.user.provider_profile
        try:
            order = Order.objects.get(pk=pk, provider=provider_profile)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi yoki sizga tegishli emas.'}, status=status.HTTP_404_NOT_FOUND)

        # Provider can finish if status is ACCEPTED or IN_PROGRESS
        if order.status not in [Order.Status.ACCEPTED, Order.Status.IN_PROGRESS]:
            return Response({'error': 'Buyurtma statusi mos kelmaydi.'}, status=status.HTTP_400_BAD_REQUEST)

        is_successful = request.data.get('is_successful')
        if is_successful is None:
            return Response({'error': 'is_successful maydoni majburiy.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.AWAITING_CONFIRMATION
        order.is_successful = bool(is_successful)
        order.awaiting_confirm_at = timezone.now()
        order.save()

        # Notify user
        send_notification(
            user=order.user,
            title="Buyurtma yakunlandi",
            message="Provayder ishni yakunladi va tasdiqlashingizni kutmoqda.",
            type="CONFIRMATION_REQUEST",
            link=f"/orders/{order.id}"
        )
        return Response(OrderSerializer(order).data)

class OrderConfirmView(APIView):
    permission_classes = [IsUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi yoki sizga tegishli emas.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.AWAITING_CONFIRMATION:
            return Response({'error': 'Faqat tasdiqlash kutilayotgan (AWAITING_CONFIRMATION) buyurtmalarni tasdiqlash mumkin.'}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')
        if action not in ['confirm', 'dispute']:
            return Response({'error': 'action maydoni confirm yoki dispute bo\'lishi kerak.'}, status=status.HTTP_400_BAD_REQUEST)

        provider = order.provider

        if action == 'confirm':
            order.status = Order.Status.COMPLETED
            order.save()

            # Update provider reliability
            if order.is_successful:
                provider.successful_orders += 1
            else:
                provider.failed_orders += 1
            
            provider.reliability = calculate_reliability(provider.successful_orders, provider.failed_orders)
            provider.save()

            # Notify provider
            send_notification(
                user=provider.user,
                title="Buyurtma tasdiqlandi",
                message=f"Buyurtmachi buyurtmani tasdiqladi. Buyurtma #{order.id} yakunlandi.",
                type="SYSTEM",
                link=f"/orders/{order.id}"
            )
        else:
            order.status = Order.Status.DISPUTED
            order.save()

            # Notify provider
            send_notification(
                user=provider.user,
                title="Shikoyat arizasi",
                message=f"Buyurtmachi buyurtma yuzasidan shikoyat qildi. Buyurtma #{order.id}",
                type="DISPUTE",
                link=f"/orders/{order.id}"
            )

        return Response(OrderSerializer(order).data)

from rest_framework.generics import ListCreateAPIView

class OrderMessagesView(ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_id = self.kwargs.get('pk')
        
        try:
            if user.role == 'PROVIDER':
                order = Order.objects.get(pk=order_id, provider=user.provider_profile)
            else:
                order = Order.objects.get(pk=order_id, user=user)
        except Order.DoesNotExist:
            return Message.objects.none()

        return Message.objects.filter(order=order).order_by('created_at')

    def perform_create(self, serializer):
        user = self.request.user
        order_id = self.kwargs.get('pk')

        try:
            if user.role == 'PROVIDER':
                order = Order.objects.get(pk=order_id, provider=user.provider_profile)
            else:
                order = Order.objects.get(pk=order_id, user=user)
        except Order.DoesNotExist:
            raise Response({'error': 'Buyurtma topilmadi yoki sizga ruxsat yo\'q.'}, status=status.HTTP_403_FORBIDDEN)

        serializer.save(sender=user, order=order)

