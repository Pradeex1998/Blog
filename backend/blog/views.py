from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import (PostSerializer, PostListSerializer, PostCreateSerializer,
                         CommentSerializer, LikeSerializer)
from django.db.models import Q

# Create your views here.

class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Post.objects.filter(status='published')
        
        # Filter by author if provided
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        # Filter by tag if provided
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        
        return queryset

class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Post.objects.filter(status='published')

class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostUpdateView(generics.UpdateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_manager():
            return Post.objects.all()
        else:
            return Post.objects.filter(author=user)

class PostDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_manager():
            return Post.objects.all()
        else:
            return Post.objects.filter(author=user)
    
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        post.delete()
        return Response({
            'message': 'Post deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

class CommentListView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id, is_approved=True)
    
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(author=self.request.user, post=post)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_manager():
            return Comment.objects.all()
        else:
            return Comment.objects.filter(author=user)

class LikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        is_like = request.data.get('is_like', True)
        
        serializer = LikeSerializer(data={
            'post': post.id,
            'is_like': is_like
        }, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': f'Post {"liked" if is_like else "disliked"} successfully',
                'like_count': post.like_count,
                'dislike_count': post.dislike_count
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPostsView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Always return only posts authored by the current user
        return Post.objects.filter(author=user)

class AdminPostManagementView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Post.objects.all()
        elif user.is_manager():
            return Post.objects.all()
        else:
            return Post.objects.none()

class PostStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        new_status = request.data.get('status')
        
        if new_status not in ['draft', 'published', 'archived']:
            return Response({
                'error': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check permissions
        user = request.user
        if not (user.is_admin() or user.is_manager() or post.author == user):
            return Response({
                'error': 'You do not have permission to update this post'
            }, status=status.HTTP_403_FORBIDDEN)
        
        post.status = new_status
        if new_status == 'published' and not post.published_at:
            from django.utils import timezone
            post.published_at = timezone.now()
        post.save()

        # Custom message for frontend toast
        if new_status == 'published':
            msg = 'Post approved!'
        elif new_status == 'draft':
            msg = 'Post set to draft!'
        elif new_status == 'archived':
            msg = 'Post archived!'
        else:
            msg = f'Post status updated to {new_status}'
        
        return Response({
            'message': msg,
            'post': PostSerializer(post).data
        }, status=status.HTTP_200_OK)
