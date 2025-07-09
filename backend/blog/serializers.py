from rest_framework import serializers
from .models import Post, Comment, Like
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    post = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'parent', 'content', 'created_at', 
                 'updated_at', 'is_approved', 'is_reply', 'replies')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'is_reply', 'post')
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ('id', 'post', 'user', 'is_like', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Update existing like or create new one
        like, created = Like.objects.update_or_create(
            post=validated_data['post'],
            user=validated_data['user'],
            defaults={'is_like': validated_data['is_like']}
        )
        return like

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    comment_count = serializers.ReadOnlyField()
    user_like = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'description', 'note', 'author', 'status', 'featured_image',
                 'created_at', 'updated_at', 'published_at',
                 'like_count', 'dislike_count', 'comment_count', 
                 'user_like', 'comments')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 
                           'like_count', 'dislike_count', 'comment_count', 'user_like')
    
    def get_user_like(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                like = obj.likes.get(user=request.user)
                return like.is_like
            except Like.DoesNotExist:
                return None
        return None
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    comment_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'description', 'note', 'author', 'status', 'featured_image',
                 'created_at', 'published_at',
                 'like_count', 'dislike_count', 'comment_count')

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('title', 'description', 'note', 'status', 'featured_image')
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data) 