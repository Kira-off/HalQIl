from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']
        read_only_fields = ['id', 'wallet_id', 'role', 'status']

class UsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.CharField()

    def validate(self, attrs):
        username_val = attrs.get(self.username_field)
        password = attrs.get('password')

        try:
            user_obj = User.objects.get(username=username_val)
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Foydalanuvchi topilmadi.'})

        user = authenticate(request=self.context.get('request'), email=user_obj.email, password=password)

        if not user:
            raise serializers.ValidationError({'detail': 'Parol noto\'g\'ri.'})

        if user.status != User.Status.ACTIVE:
            raise serializers.ValidationError({'detail': 'Hisob faol emas.'})

        self.user = user

        # Set user as online upon successful login
        user.is_online = True
        user.save()

        data = {}
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        return data
