from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Add method fields for role checking
    is_admin = serializers.SerializerMethodField()
    is_manager = serializers.SerializerMethodField()
    is_user = serializers.SerializerMethodField()
    can_manage_users = serializers.SerializerMethodField()
    can_manage_posts = serializers.SerializerMethodField()
    can_create_posts = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name', 
                 'role', 'bio', 'profile_picture', 'date_of_birth', 'created_at', 'updated_at',
                 'is_admin', 'is_manager', 'is_user', 'can_manage_users', 'can_manage_posts', 'can_create_posts')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_is_admin(self, obj):
        return obj.is_admin()
    
    def get_is_manager(self, obj):
        return obj.is_manager()
    
    def get_is_user(self, obj):
        return obj.is_user()
    
    def get_can_manage_users(self, obj):
        return obj.can_manage_users()
    
    def get_can_manage_posts(self, obj):
        return obj.can_manage_posts()
    
    def get_can_create_posts(self, obj):
        return obj.can_create_posts()
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    # Add method fields for role checking
    is_admin = serializers.SerializerMethodField()
    is_manager = serializers.SerializerMethodField()
    is_user = serializers.SerializerMethodField()
    can_manage_users = serializers.SerializerMethodField()
    can_manage_posts = serializers.SerializerMethodField()
    can_create_posts = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'bio', 'profile_picture', 'date_of_birth', 'created_at', 'updated_at',
                 'is_admin', 'is_manager', 'is_user', 'can_manage_users', 'can_manage_posts', 'can_create_posts')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_is_admin(self, obj):
        return obj.is_admin()
    
    def get_is_manager(self, obj):
        return obj.is_manager()
    
    def get_is_user(self, obj):
        return obj.is_user()
    
    def get_can_manage_users(self, obj):
        return obj.can_manage_users()
    
    def get_can_manage_posts(self, obj):
        return obj.can_manage_posts()
    
    def get_can_create_posts(self, obj):
        return obj.can_create_posts()
    
    def validate_role(self, value):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            # Only admins can change roles
            if not user.is_admin():
                raise serializers.ValidationError("Only admins can change user roles.")
        return value

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'created_at', 'is_active')
        read_only_fields = ('id', 'created_at')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value 