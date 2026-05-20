from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, RetrieveUpdateAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from utils.permissions import IsProvider, IsUser
from .models import ProviderProfile, ProviderApplication, ProviderSchedule, ProviderSkill
from .serializers import (
    ProviderProfileSerializer,
    ProviderApplicationSerializer,
    ProviderApplicationCreateSerializer,
    ProviderScheduleSerializer,
    ProviderSkillSerializer
)

class ProviderListView(ListAPIView):
    serializer_class = ProviderProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ProviderProfile.objects.filter(user__status='ACTIVE')
        category = self.request.query_params.get('category')
        district = self.request.query_params.get('district')
        availability_status = self.request.query_params.get('availability_status')
        search_username = self.request.query_params.get('username')
        search_bio = self.request.query_params.get('bio')

        if category:
            queryset = queryset.filter(skills__skill__category_id=category)
        if district:
            queryset = queryset.filter(districts__district_name__iexact=district)
        if availability_status:
            queryset = queryset.filter(availability_status=availability_status)
        if search_username:
            queryset = queryset.filter(user__username__icontains=search_username)
        if search_bio:
            queryset = queryset.filter(bio__icontains=search_bio)

        return queryset.distinct()

class ProviderDetailView(RetrieveAPIView):
    queryset = ProviderProfile.objects.filter(user__status='ACTIVE')
    serializer_class = ProviderProfileSerializer
    permission_classes = [AllowAny]

class ProviderApplicationView(CreateAPIView):
    permission_classes = [IsUser]
    serializer_class = ProviderApplicationCreateSerializer

    def post(self, request, *args, **kwargs):
        if ProviderApplication.objects.filter(user=request.user, status=ProviderApplication.Status.PENDING).exists():
            return Response({'error': 'Sizda kutilayotgan ariza allaqachon mavjud.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)

class MyApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = ProviderApplication.objects.filter(user=request.user).order_by('-created_at').first()
        if not application:
            return Response({'detail': 'Ariza topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProviderApplicationSerializer(application)
        return Response(serializer.data)

class MyProviderProfileView(RetrieveUpdateAPIView):
    serializer_class = ProviderProfileSerializer
    permission_classes = [IsProvider]

    def get_object(self):
        return self.request.user.provider_profile

    def patch(self, request, *args, **kwargs):
        allowed_keys = {'bio', 'availability_status'}
        extra_keys = set(request.data.keys()) - allowed_keys
        if extra_keys:
            return Response({'error': f'Ushbu maydonlarni o\'zgartirish mumkin emas: {", ".join(extra_keys)}'}, status=status.HTTP_400_BAD_REQUEST)
        return super().patch(request, *args, **kwargs)

class ProviderScheduleView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        provider = request.user.provider_profile
        schedules = provider.schedule.all()
        serializer = ProviderScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    def post(self, request):
        provider = request.user.provider_profile
        data = request.data
        if isinstance(data, list):
            created_schedules = []
            for item in data:
                day_of_week = item.get('day_of_week')
                schedule, created = ProviderSchedule.objects.update_or_create(
                    provider=provider,
                    day_of_week=day_of_week,
                    defaults={
                        'open_time': item.get('open_time'),
                        'close_time': item.get('close_time'),
                        'is_active': item.get('is_active', True)
                    }
                )
                created_schedules.append(schedule)
            serializer = ProviderScheduleSerializer(created_schedules, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            day_of_week = data.get('day_of_week')
            schedule, created = ProviderSchedule.objects.update_or_create(
                provider=provider,
                day_of_week=day_of_week,
                defaults={
                    'open_time': data.get('open_time'),
                    'close_time': data.get('close_time'),
                    'is_active': data.get('is_active', True)
                }
            )
            serializer = ProviderScheduleSerializer(schedule)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProviderSkillView(APIView):
    permission_classes = [IsProvider]

    def post(self, request):
        provider = request.user.provider_profile
        serializer = ProviderSkillSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        skill = serializer.validated_data['skill']
        if ProviderSkill.objects.filter(provider=provider, skill=skill).exists():
            return Response({'error': 'Sizda ushbu skill allaqachon mavjud.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(provider=provider)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
