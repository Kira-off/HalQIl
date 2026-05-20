from django.urls import path
from .views import CategoryListView, DistrictListView

urlpatterns = [
    path('catalog/categories/', CategoryListView.as_view(), name='category-list'),
    path('catalog/districts/', DistrictListView.as_view(), name='district-list'),
]
