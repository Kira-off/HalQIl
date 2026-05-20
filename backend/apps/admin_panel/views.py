import json
from django.contrib.auth import get_user_model
from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from utils.permissions import IsSuperAdmin
from utils.helpers import calculate_reliability
from apps.accounts.serializers import UserSerializer
from apps.providers.models import ProviderApplication, ProviderProfile, ProviderSkill, ProviderDistrict
from apps.providers.serializers import ProviderApplicationSerializer
from apps.catalog.models import Category, Skill
from apps.catalog.serializers import CategorySerializer, SkillSerializer
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.notifications.models import Notification
from apps.notifications.views import send_notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

class AdminUserPagination(PageNumberPagination):
    page_size = 20

class AdminUserListView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]
    pagination_class = AdminUserPagination

    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filtering & Search
        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        status_param = self.request.query_params.get('status')
        ordering = self.request.query_params.get('ordering')

        if search:
            queryset = queryset.filter(username__icontains=search) | queryset.filter(email__icontains=search) | queryset.filter(first_name__icontains=search) | queryset.filter(last_name__icontains=search)
        if role:
            queryset = queryset.filter(role=role)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

class AdminUserRoleView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        role = request.data.get('role')
        if role not in [User.Role.USER, User.Role.PROVIDER, User.Role.SUPER_ADMIN]:
            return Response({'error': 'Noto\'g\'ri rol.'}, status=status.HTTP_400_BAD_REQUEST)

        user.role = role
        user.save()
        return Response(UserSerializer(user).data)

class AdminUserFreezeView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if user.status == User.Status.ACTIVE:
            user.status = User.Status.FROZEN
        elif user.status == User.Status.FROZEN:
            user.status = User.Status.ACTIVE
        else:
            return Response({'error': 'Foydalanuvchi statusi ACTIVE yoki FROZEN emas.'}, status=status.HTTP_400_BAD_REQUEST)

        user.save()
        return Response(UserSerializer(user).data)

class AdminUserBlockView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if user.status == User.Status.BLOCKED:
            user.status = User.Status.ACTIVE
        else:
            user.status = User.Status.BLOCKED

        user.save()
        return Response(UserSerializer(user).data)

class AdminUserDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        user.status = User.Status.DELETED
        user.save()
        return Response({'message': 'Foydalanuvchi o\'chirildi.'})

class AdminApplicationListView(ListAPIView):
    serializer_class = ProviderApplicationSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        queryset = ProviderApplication.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

class AdminApplicationDetailView(RetrieveAPIView):
    queryset = ProviderApplication.objects.all()
    serializer_class = ProviderApplicationSerializer
    permission_classes = [IsSuperAdmin]

class AdminApplicationApproveView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            application = ProviderApplication.objects.get(pk=pk)
        except ProviderApplication.DoesNotExist:
            return Response({'error': 'Ariza topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if application.status != ProviderApplication.Status.PENDING:
            return Response({'error': 'Ariza allaqachon ko\'rib chiqilgan.'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = ProviderApplication.Status.APPROVED
        application.save()

        user = application.user
        user.role = User.Role.PROVIDER
        user.save()

        # Create ProviderProfile
        provider_profile, created = ProviderProfile.objects.get_or_create(
            user=user,
            defaults={
                'bio': application.about_me,
                'availability_status': ProviderProfile.AvailabilityStatus.AVAILABLE
            }
        )

        # Parse skills and districts
        why_join = application.why_join
        parts = why_join.split("\n---APPLICATION_DATA---\n")
        districts = []
        skills = []
        if len(parts) > 1:
            try:
                data = json.loads(parts[1])
                districts = data.get('districts', [])
                skills = data.get('skills', [])
            except Exception:
                pass

        # Create ProviderDistricts
        for dist_name in districts:
            ProviderDistrict.objects.get_or_create(
                provider=provider_profile,
                district_name=dist_name
            )

        # Create ProviderSkills
        for skill_item in skills:
            skill_id = None
            service_type = ProviderSkill.ServiceType.BOTH
            experience_years = 0
            price_from = 0
            price_to = 0
            description = ''
            
            if isinstance(skill_item, dict):
                skill_id = skill_item.get('skill_id')
                service_type = skill_item.get('service_type', ProviderSkill.ServiceType.BOTH)
                experience_years = skill_item.get('experience_years', 0)
                price_from = skill_item.get('price_from', 0)
                price_to = skill_item.get('price_to', 0)
                description = skill_item.get('description', '')
            elif isinstance(skill_item, (int, str)):
                skill_id = skill_item
                
            if skill_id:
                try:
                    skill_obj = Skill.objects.get(pk=skill_id)
                    ProviderSkill.objects.get_or_create(
                        provider=provider_profile,
                        skill=skill_obj,
                        defaults={
                            'service_type': service_type,
                            'experience_years': experience_years,
                            'price_from': price_from,
                            'price_to': price_to,
                            'description': description
                        }
                    )
                except Skill.DoesNotExist:
                    pass

        # Notify user
        send_notification(
            user=user,
            title="Provayderlik arizasi tasdiqlandi",
            message="Tabriklaymiz, sizning provayderlik arizangiz tasdiqlandi!",
            type="APPLICATION_RESPONSE",
            link="/provider/profile/"
        )

        return Response(ProviderApplicationSerializer(application).data)

class AdminApplicationRejectView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            application = ProviderApplication.objects.get(pk=pk)
        except ProviderApplication.DoesNotExist:
            return Response({'error': 'Ariza topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if application.status != ProviderApplication.Status.PENDING:
            return Response({'error': 'Ariza allaqachon ko\'rib chiqilgan.'}, status=status.HTTP_400_BAD_REQUEST)

        rejection_note = request.data.get('rejection_note', 'Sababi ko\'rsatilmadi.')

        application.status = ProviderApplication.Status.REJECTED
        application.rejection_note = rejection_note
        application.save()

        # Notify user
        send_notification(
            user=application.user,
            title="Provayderlik arizasi rad etildi",
            message=f"Afsuski, sizning provayderlik arizangiz rad etildi. Sababi: {rejection_note}",
            type="APPLICATION_RESPONSE"
        )

        return Response(ProviderApplicationSerializer(application).data)

class AdminCategoryListView(ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsSuperAdmin]

class AdminCategoryCreateView(CreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsSuperAdmin]

class AdminCategoryToggleView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Kategoriya topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        category.is_active = not category.is_active
        category.save()
        return Response(CategorySerializer(category).data)

class AdminSkillCreateView(CreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsSuperAdmin]

class AdminSkillToggleView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            skill = Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return Response({'error': 'Skill topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        skill.is_active = not skill.is_active
        skill.save()
        return Response(SkillSerializer(skill).data)

class AdminBroadcastView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('type', Notification.NotificationType.SYSTEM)
        role = request.data.get('role')

        if not title or not message:
            return Response({'error': 'Title va Message majburiy.'}, status=status.HTTP_400_BAD_REQUEST)

        if role:
            users = User.objects.filter(role=role)
            for u in users:
                send_notification(user=u, title=title, message=message, type=notification_type)
            return Response({'message': f'{users.count()} ta userga xabar yuborildi.'})
        else:
            # Global Notification
            notification = Notification.objects.create(
                title=title,
                message=message,
                type=notification_type,
                is_global=True
            )
            
            # Broadcast via Channels
            channel_layer = get_channel_layer()
            if channel_layer:
                try:
                    async_to_sync(channel_layer.group_send)(
                        'notifications_global',
                        {
                            'type': 'global_notification_message',
                            'id': notification.id,
                            'title': notification.title,
                            'message': notification.message,
                            'notification_type': notification.type,
                            'created_at': str(notification.created_at)
                        }
                    )
                except Exception:
                    pass

            return Response({'message': 'Global xabar yaratildi.'})

class AdminDisputedOrderListView(ListAPIView):
    queryset = Order.objects.filter(status=Order.Status.DISPUTED).order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsSuperAdmin]

class AdminResolveDisputeView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Buyurtma topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.DISPUTED:
            return Response({'error': 'Faqat shikoyat ostidagi (DISPUTED) buyurtmalarni hal qilish mumkin.'}, status=status.HTTP_400_BAD_REQUEST)

        winner = request.data.get('winner')
        if winner not in ['user', 'provider']:
            return Response({'error': 'winner faqat user yoki provider bo\'lishi kerak.'}, status=status.HTTP_400_BAD_REQUEST)

        provider = order.provider

        if winner == 'user':
            order.status = Order.Status.COMPLETED
            order.save()

            # provider fault: reliability decreases
            provider.failed_orders += 1
            provider.reliability = calculate_reliability(provider.successful_orders, provider.failed_orders)
            provider.save()

            # Notifications
            send_notification(
                user=order.user,
                title="Shikoyat sizning foydangizga hal qilindi",
                message=f"Buyurtma #{order.id} bo'yicha shikoyat sizning foydangizga hal qilindi va yakunlandi.",
                type="SYSTEM",
                link=f"/orders/{order.id}"
            )
            send_notification(
                user=provider.user,
                title="Shikoyat buyurtmachi foydasiga hal qilindi",
                message=f"Buyurtma #{order.id} bo'yicha shikoyat buyurtmachi foydasiga hal qilindi. Sizning ishonchlilik darajangiz pasaydi.",
                type="SYSTEM",
                link=f"/orders/{order.id}"
            )
        else:
            order.status = Order.Status.FAILED
            order.save()

            # user fault
            # Notifications
            send_notification(
                user=order.user,
                title="Shikoyat provayder foydasiga hal qilindi",
                message=f"Buyurtma #{order.id} bo'yicha shikoyat provayder foydasiga hal qilindi va bekor qilindi.",
                type="SYSTEM",
                link=f"/orders/{order.id}"
            )
            send_notification(
                user=provider.user,
                title="Shikoyat sizning foydangizga hal qilindi",
                message=f"Buyurtma #{order.id} bo'yicha shikoyat sizning foydangizga hal qilindi.",
                type="SYSTEM",
                link=f"/orders/{order.id}"
            )

        return Response(OrderSerializer(order).data)
