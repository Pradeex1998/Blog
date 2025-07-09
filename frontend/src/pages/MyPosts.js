import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import { SlLike, SlDislike } from 'react-icons/sl';
import { toast } from 'react-toastify';

const MyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getUserPosts();
        setPosts(response?.data || []);
      } catch (err) {
        setError('Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading your posts...</span>
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
      {/* <h2 className="mb-2">My Posts</h2> */}
      {/* <p className="text-gray-500 mb-4">Only your posts are shown here.</p> */}
      {posts.length > 0 ? (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card-horizontal" style={{ position: 'relative' }}>
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
                </div>
                <div className="post-actions">
                  <button className="icon-btn" title="Like" disabled>
                    <SlLike size={20} style={{ verticalAlign: 'middle' }} />
                    <span>{post.like_count || 0}</span>
                  </button>
                  <button className="icon-btn" title="Dislike" disabled>
                    <SlDislike size={20} style={{ verticalAlign: 'middle' }} />
                    <span>{post.dislike_count || 0}</span>
                  </button>
                  <button className="icon-btn" title="Comments" disabled>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>{post.comment_count || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-700 text-center font-semibold" style={{fontSize: '1.1em'}}>You have not created any posts yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts; 