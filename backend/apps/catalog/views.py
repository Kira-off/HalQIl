from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Category
from .serializers import CategorySerializer

class CategoryListView(ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # GET /catalog/categories/ — все активные категории со скиллами
        # Filter both category and nested skills to be active
        return Category.objects.filter(is_active=True).prefetch_related('skills')

class DistrictListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        districts = [
            "Yunusobod",
            "Mirzo Ulug'bek",
            "Chilonzor",
            "Mirobod",
            "Yakkasaroy",
            "Uchtepa",
            "Shayxontohur",
            "Olmazor",
            "Sergeli",
            "Yangihayot",
            "Yashnobod",
            "Bektemir"
        ]
        return Response(districts)
