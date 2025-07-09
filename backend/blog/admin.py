from django.contrib import admin
from .models import Post, Comment, Like

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'created_at', 'published_at', 'like_count', 'comment_count')
    list_filter = ('status', 'created_at', 'author__role')
    search_fields = ('title', 'content', 'author__username')
    ordering = ('-created_at',)
    readonly_fields = ('like_count', 'dislike_count', 'comment_count')
    
    fieldsets = (
        (None, {'fields': ('title', 'content', 'author', 'status')}),
        ('Media', {'fields': ('featured_image',)}),
        ('Meta', {'fields': ('meta_description', 'tags')}),
        ('Statistics', {'fields': ('like_count', 'dislike_count', 'comment_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'published_at')}),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.role == 'admin':
            return qs
        elif request.user.role == 'manager':
            return qs.filter(author__role='user')
        else:
            return qs.filter(author=request.user)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('content', 'author', 'post', 'is_approved', 'created_at', 'is_reply')
    list_filter = ('is_approved', 'created_at', 'author__role')
    search_fields = ('content', 'author__username', 'post__title')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('content', 'author', 'post', 'parent')}),
        ('Moderation', {'fields': ('is_approved',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.role == 'admin':
            return qs
        elif request.user.role == 'manager':
            return qs.filter(author__role='user')
        else:
            return qs.filter(author=request.user)

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'is_like', 'created_at')
    list_filter = ('is_like', 'created_at', 'user__role')
    search_fields = ('user__username', 'post__title')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('user', 'post', 'is_like')}),
        ('Timestamp', {'fields': ('created_at',)}),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        elif request.user.role == 'admin':
            return qs
        elif request.user.role == 'manager':
            return qs.filter(user__role='user')
        else:
            return qs.filter(user=request.user)
