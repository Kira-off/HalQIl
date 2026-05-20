from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # GET /notifications/
        # Returns: personal notifications + all is_global=True
        # Sorted by created_at desc
        return Notification.objects.filter(
            user=self.request.user
        ) | Notification.objects.filter(is_global=True)

class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response({'error': 'Uvedomlenie ne naydeno.'}, status=status.HTTP_404_NOT_FOUND)

        if not notification.is_global and notification.user != request.user:
            return Response({'error': 'Dostup zapreshen.'}, status=status.HTTP_403_FORBIDDEN)

        notification.is_read = True
        notification.save()
        return Response({'message': 'Uvedomlenie prochitano.'})

def send_notification(user, title, message, type, link=''):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=type,
        link=link
    )
    
    channel_layer = get_channel_layer()
    if channel_layer:
        try:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.id}',
                {
                    'type': 'notification_message',
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'notification_type': notification.type,
                    'link': notification.link,
                    'created_at': str(notification.created_at)
                }
            )
        except Exception:
            pass
    return notification
