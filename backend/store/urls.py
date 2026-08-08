from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FootwearViewSet, OrderViewSet, chat, auth_login

router = DefaultRouter()
router.register(r'inventory', FootwearViewSet, basename='inventory')
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('auth/login/', auth_login, name='auth-login'),
    path('chat/', chat, name='chat'),
    path('', include(router.urls)),
]
