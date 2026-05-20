from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from utils.permissions import IsProvider
from .models import Organization, OrganizationMember
from .serializers import OrganizationSerializer, OrganizationMemberSerializer

class OrganizationListView(ListAPIView):
    queryset = Organization.objects.all().order_by('-created_at')
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]

class OrganizationDetailView(RetrieveAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]

class OrganizationCreateView(CreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsProvider]

    def perform_create(self, serializer):
        serializer.save(admin_provider=self.request.user.provider_profile)

class OrganizationJoinView(APIView):
    permission_classes = [IsProvider]

    def post(self, request):
        provider = request.user.provider_profile
        organization_id = request.data.get('organization')
        if not organization_id:
            return Response({'error': 'organization maydoni majburiy.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            organization = Organization.objects.get(pk=organization_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Tashkilot topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if provider is the admin
        if organization.admin_provider == provider:
            return Response({'error': 'Siz ushbu tashkilotning adminisiz.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already a member or pending
        if OrganizationMember.objects.filter(organization=organization, provider=provider).exists():
            return Response({'error': 'Siz ushbu tashkilotga a\'zolik uchun ariza topshirgansiz yoki allaqachon a\'zosiz.'}, status=status.HTTP_400_BAD_REQUEST)

        member = OrganizationMember.objects.create(
            organization=organization,
            provider=provider,
            status=OrganizationMember.Status.PENDING
        )

        return Response(OrganizationMemberSerializer(member).data, status=status.HTTP_201_CREATED)
