import axios from 'axios';

// Posts API
export const postsAPI = {
  // Get all published posts
  getAllPosts: (params = {}) => axios.get('/posts/', { params }),
  
  // Get a single post
  getPost: (id) => axios.get(`/posts/${id}/`),
  
  // Create a new post
  createPost: (postData) => axios.post('/posts/create/', postData),
  
  // Update a post
  updatePost: (id, postData) => axios.put(`/posts/${id}/update/`, postData),
  
  // Delete a post
  deletePost: (id) => axios.delete(`/posts/${id}/delete/`),
  
  // Update post status
  updatePostStatus: (id, status) => axios.post(`/posts/${id}/status/`, { status }),
  
  // Get user's posts
  getUserPosts: () => axios.get('/my-posts/'),
  
  // Get posts for admin/manager management
  getAdminPosts: () => axios.get('/admin/posts/'),
  
  // Like/dislike a post
  likePost: (id, isLike) => axios.post(`/posts/${id}/like/`, { is_like: isLike }),
};

// Comments API
export const commentsAPI = {
  // Get comments for a post
  getComments: (postId) => axios.get(`/posts/${postId}/comments/`),
  
  // Create a comment
  createComment: (postId, content, parentId = null) => {
    const payload = parentId ? { content, parent: parentId } : { content };
    return axios.post(`/posts/${postId}/comments/`, payload);
  },
  
  // Update a comment
  updateComment: (id, content) => axios.put(`/comments/${id}/`, { content }),
  
  // Delete a comment
  deleteComment: (id) => axios.delete(`/comments/${id}/`),
};

// Users API
export const usersAPI = {
  // Get all users (admin/manager only)
  getAllUsers: () => axios.get('/auth/users/'),
  
  // Get user details
  getUser: (id) => axios.get(`/auth/users/${id}/`),
  
  // Update user
  updateUser: (id, userData) => axios.put(`/auth/users/${id}/`, userData),
  
  // Delete user
  deleteUser: (id) => axios.delete(`/auth/users/${id}/`),
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => axios.post('/auth/login/', credentials),
  
  // Register
  register: (userData) => axios.post('/auth/register/', userData),
  
  // Logout
  logout: (refreshToken) => axios.post('/auth/logout/', { refresh_token: refreshToken }),
  
  // Get user profile
  getProfile: () => axios.get('/auth/profile/'),
  
  // Update profile
  updateProfile: (userData) => axios.put('/auth/profile/', userData),
  
  // Change password
  changePassword: (passwords) => axios.post('/auth/change-password/', passwords),
  
  // Refresh token
  refreshToken: (refreshToken) => axios.post('/token/refresh/', { refresh: refreshToken }),
}; 