import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';
// CSS is now imported via global styles

const BlogViewer = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts();
      setPosts(response?.data || []);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await commentsAPI.getComments(postId);
      setComments(response?.data || []);
    } catch (err) {
      console.error('Comments error:', err);
    }
  };

  const handleLike = async (postId, isLike) => {
    try {
      await postsAPI.likePost(postId, isLike);
      // Refresh posts to get updated like counts
      fetchPosts();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;
    
    try {
      await commentsAPI.createComment(postId, newComment);
      setNewComment('');
      fetchComments(postId);
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    await fetchComments(post.id);
  };

  const closePost = () => {
    setSelectedPost(null);
    setComments([]);
  };

  if (loading) {
    return (
      <div className="blog-container">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading blog posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="page">
        <button onClick={closePost} className="btn-secondary" style={{ marginBottom: '20px' }}>
          ← Back to Posts
        </button>
        
        <article className="blog-post">
          <h1>{selectedPost.title}</h1>
          <div className="post-meta">
            <span>By {typeof selectedPost.author_name === 'string' ? selectedPost.author_name : 
                 typeof selectedPost.author === 'string' ? selectedPost.author : 
                 selectedPost.author?.username || 'Unknown Author'}</span>
            <span>{selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : 'Unknown Date'}</span>
          </div>
          
          <div className="post-content">
            {selectedPost.content}
          </div>
          
          <div className="post-actions">
            <button
              onClick={() => handleLike(selectedPost.id, true)}
              className="like-btn"
            >
              👍 {selectedPost.like_count || 0}
            </button>
            <button
              onClick={() => handleLike(selectedPost.id, false)}
              className="dislike-btn"
            >
              👎 {selectedPost.dislike_count || 0}
            </button>
          </div>
          
          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            
            {user && (
              <div className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                />
                <button
                  onClick={() => handleComment(selectedPost.id)}
                  className="btn-primary"
                >
                  Post Comment
                </button>
              </div>
            )}
            
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{typeof comment.author_name === 'string' ? comment.author_name : 
                           typeof comment.author === 'string' ? comment.author : 
                           comment.author?.username || 'Unknown Author'}</strong>
                    <span>{comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                  </div>
                  <div className="comment-content">{comment.content || 'No content'}</div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1 className="blog-title">Blog Posts</h1>
        <p className="blog-subtitle">Read the latest blog posts from our community.</p>
      </div>
      
      {posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card" onClick={() => openPost(post)}>
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="post-image"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                />
              )}
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                  <span>By {typeof post.author_name === 'string' ? post.author_name : 
                       typeof post.author === 'string' ? post.author : 
                       post.author?.username || 'Unknown Author'}</span>
                  <span>•</span>
                  <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                </div>
                <p className="post-description">{post.description || 'No description'}</p>
                <p className="post-note">{post.note || ''}</p>
                <div className="post-meta post-actions">
                  <button
                    className="like-btn"
                    onClick={e => { e.stopPropagation(); handleLike(post.id, true); }}
                    title="Like"
                  >
                    👍 {post.like_count || 0}
                  </button>
                  <button
                    className="dislike-btn"
                    onClick={e => { e.stopPropagation(); handleLike(post.id, false); }}
                    title="Dislike"
                  >
                    👎 {post.dislike_count || 0}
                  </button>
                  <span className="comment-count" title="Comments">
                    💬 {post.comment_count || 0}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-center">No published posts found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogViewer; 