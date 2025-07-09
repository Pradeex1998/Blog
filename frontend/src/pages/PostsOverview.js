import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';
import { SlLike, SlDislike } from 'react-icons/sl';
import { FiTrash } from 'react-icons/fi';
import { toast } from 'react-toastify';
// CSS is now imported via global styles

const PostsOverview = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const isAdminOrManager = user && (user.is_admin || user.is_manager);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let response;
        if (isAdminOrManager) {
          response = await postsAPI.getAdminPosts();
        } else {
          response = await postsAPI.getAllPosts();
        }
        setPosts(response?.data || []);
      } catch (err) {
        setError('Failed to load posts');
        console.error('Posts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAdminOrManager]);

  // Refresh posts without resetting filter
  const refreshPosts = async () => {
    let response;
    if (isAdminOrManager) {
      response = await postsAPI.getAdminPosts();
    } else {
      response = await postsAPI.getAllPosts();
    }
    setPosts(response.data);
  };

  const handleLike = async (postId, isLike) => {
    try {
      await postsAPI.likePost(postId, isLike);
      await refreshPosts();
    } catch (err) {
      setError('Failed to update like/dislike');
      console.error('Like error:', err);
    }
  };

  const handleOpenComments = async (postId) => {
    setOpenComments(openComments === postId ? null : postId);
    if (openComments !== postId) {
      try {
        const response = await commentsAPI.getComments(postId);
        setComments(response?.data || []);
      } catch (err) {
        setComments([]);
      }
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;
    try {
      await commentsAPI.createComment(postId, newComment);
      setNewComment('');
      const response = await commentsAPI.getComments(postId);
      setComments(response?.data || []);
      await refreshPosts();
    } catch (err) {
      // handle error
    }
  };

  // Filter posts by status
  const filteredPosts = statusFilter === 'all' ? posts : posts.filter(post => {
    if (statusFilter === 'approved') return post.status === 'published';
    if (statusFilter === 'draft') return post.status === 'draft';
    if (statusFilter === 'archived') return post.status === 'archived';
    return true;
  });

  // Helper to update posts and reset filter
  const refreshPostsAndShowAll = async () => {
    let response;
    if (isAdminOrManager) {
      response = await postsAPI.getAdminPosts();
    } else {
      response = await postsAPI.getAllPosts();
    }
    setPosts(response.data);
    setStatusFilter('all');
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.deletePost(postId);
      toast.success('Post deleted!');
      await refreshPostsAndShowAll();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="blog-header">
        <div
          className="d-flex align-items- mt-3 mb-5"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          {isAdminOrManager && (
            <div style={{ marginRight: 16 }}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="form-input form-control"
                style={{ width: 180 }}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          )}
          <button
            className="btn btn-primary"
            style={{
              whiteSpace: 'nowrap',
              marginLeft: 0,
              marginTop: 0,
              position: 'static',
            }}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Post
          </button>
        </div>
      </div>
      {showCreateModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="modal-content" style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            maxWidth: 420,
            width: '100%',
            padding: '2rem 1.5rem',
            position: 'relative',
            minWidth: 320,
          }}>
            <CreatePostModal
              onClose={() => setShowCreateModal(false)}
              onCreated={async () => {
                setShowCreateModal(false);
                await refreshPosts();
                toast.success('Post created!');
              }}
            />
          </div>
        </div>
      )}
      {filteredPosts.length > 0 ? (
        <div className="posts-list">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card-horizontal" style={{ position: 'relative' }}>
              {/* Status badge and buttons only for admin/manager */}
              {isAdminOrManager && (
                <div style={{ position: 'absolute', right: 24, top: 24, zIndex: 2, display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                  <span className={`badge badge-${post.status === 'published' ? 'success' : post.status === 'draft' ? 'warning' : 'secondary'}`}>{post.status === 'published' ? 'Approved' : post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                  {post.status === 'draft' && (
                    <span
                      className="badge badge-success clickable"
                      style={{ cursor: 'pointer' }}
                      onClick={async () => {
                        try {
                          await postsAPI.updatePostStatus(post.id, 'published');
                          toast.success('Post approved!');
                          await refreshPostsAndShowAll();
                        } catch (err) {
                          toast.error('Failed to approve post');
                        }
                      }}
                    >
                      Approve
                    </span>
                  )}
                  {post.status === 'published' && (
                    <span
                      className="badge badge-warning clickable"
                      style={{ cursor: 'pointer' }}
                      onClick={async () => {
                        try {
                          await postsAPI.updatePostStatus(post.id, 'draft');
                          toast.success('Post set to draft!');
                          await refreshPostsAndShowAll();
                        } catch (err) {
                          toast.error('Failed to set draft');
                        }
                      }}
                    >
                      Draft
                    </span>
                  )}
                </div>
              )}
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="post-image-horizontal"
                />
              )}
              <div className="post-info-horizontal">
                {post.category && (
                  <span className="post-badge">{post.category}</span>
                )}
                <h2 className="post-title text-primary">{post.author
                    ? (post.author.first_name || post.author.last_name
                        ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim()
                        : post.author.username)
                    : 'Unknown'}</h2>
                <div className="post-author-meta post-title">
                  {post.title}
                </div>
                <p className="post-description">{post.description || 'No description'}</p>
                <p className="post-note"><strong>Note:</strong> {post.note || 'No note'}</p>
                <div className="post-meta">
                  <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                  {/* <span>•</span> */}
                  {/* <span>2 min read</span> */}
                </div>
                <div className="post-actions">
                  <button
                    className="icon-btn"
                    onClick={() => handleLike(post.id, true)}
                    title="Like"
                  >
                    <SlLike size={20} style={{ verticalAlign: 'middle' }} />
                    <span>{post.like_count || 0}</span>
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => handleLike(post.id, false)}
                    title="Dislike"
                  >
                    <SlDislike size={20} style={{ verticalAlign: 'middle' }} />
                    <span>{post.dislike_count || 0}</span>
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => handleOpenComments(post.id)}
                    title="Comments"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>{post.comment_count || 0}</span>
                  </button>
                </div>
                {(isAdminOrManager) && (
                  <button
                    className="icon-btn btn-delete"
                    style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 2, color: '#d11a2a' }}
                    title="Delete Post"
                    onClick={() => handleDelete(post.id)}
                  >
                    <FiTrash size={20} />
                  </button>
                )}
                {openComments === post.id && (
                  <div className="comments-section">
                    <h4>Comments ({comments.length})</h4>
                    {user && (
                      <div className="comment-form">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          rows={2}
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="btn-primary"
                        >
                          Post Comment
                        </button>
                      </div>
                    )}
                    <div className="comments-list">
                      {comments.length === 0 && <div className="no-comments">No comments yet.</div>}
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
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-center">No posts found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal wrapper for CreatePost
function CreatePostModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    note: '',
    status: 'draft',
    featured_image: null
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'featured_image') {
      setFormData({ ...formData, featured_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors({});
    // Client-side validation
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    else if (formData.title.length > 50) errors.title = 'Title must be at most 50 characters';
    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.length > 100) errors.description = 'Description must be at most 100 characters';
    if (!formData.note.trim()) errors.note = 'Note is required';
    else if (formData.note.length > 1500) errors.note = 'Note must be at most 1500 characters';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      await postsAPI.createPost(data);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-form-wrapper">
      <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Create New Post</h3>
        <button className="btn btn-close" onClick={onClose} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>&times;</button>
      </div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Title * <span style={{color:'#888', fontSize:'0.95em'}}>(max 50 chars)</span></label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={50}
            placeholder="Enter post title"
          />
          {formErrors.title && <div className="text-danger" style={{fontSize:'0.95em'}}>{formErrors.title}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Description * <span style={{color:'#888', fontSize:'0.95em'}}>(max 100 chars)</span></label>
          <input
            type="text"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Short description"
          />
          {formErrors.description && <div className="text-danger" style={{fontSize:'0.95em'}}>{formErrors.description}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Note * <span style={{color:'#888', fontSize:'0.95em'}}>(max 1500 chars)</span></label>
          <textarea
            name="note"
            className="form-control"
            value={formData.note}
            onChange={handleChange}
            required
            rows={5}
            maxLength={1500}
            placeholder="Write your post note"
            style={{ minHeight: 80 }}
          />
          {formErrors.note && <div className="text-danger" style={{fontSize:'0.95em'}}>{formErrors.note}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            name="featured_image"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ minWidth: 120 }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostsOverview;