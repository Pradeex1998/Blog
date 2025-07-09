import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // user not used
import { postsAPI } from '../services/api';
// CSS is now imported via global styles

const CreatePost = () => {
  // const { user } = useAuth(); // user not used
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    note: '',
    status: 'draft',
    featured_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      await postsAPI.createPost(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Create New Post</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter post title"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description *</label>
              <input
                type="text"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Short description"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Note *</label>
              <textarea
                name="note"
                className="form-control"
                value={formData.note}
                onChange={handleChange}
                required
                rows={8}
                placeholder="Write your post note"
              />
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
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
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
      </div>
    </div>
  );
};

export default CreatePost; 