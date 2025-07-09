from django.urls import path
from .views import (PostListView, PostDetailView, PostCreateView, PostUpdateView, 
                   PostDeleteView, CommentListView, CommentDetailView, LikeView,
                   UserPostsView, AdminPostManagementView, PostStatusUpdateView)

urlpatterns = [
    # Post endpoints
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/update/', PostUpdateView.as_view(), name='post-update'),
    path('posts/<int:pk>/delete/', PostDeleteView.as_view(), name='post-delete'),
    path('posts/<int:post_id>/status/', PostStatusUpdateView.as_view(), name='post-status'),
    path('posts/<int:post_id>/like/', LikeView.as_view(), name='post-like'),
    
    # Comment endpoints
    path('posts/<int:post_id>/comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # User and admin endpoints
    path('my-posts/', UserPostsView.as_view(), name='user-posts'),
    path('admin/posts/', AdminPostManagementView.as_view(), name='admin-posts'),
] 