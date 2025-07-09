import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, usersAPI } from '../services/api';
// CSS is now imported via global styles

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalManagers: 0,
    totalDraftPosts: 0,
    totalApprovedPosts: 0,
    totalComments: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts based on user role
        let postsResponse;
        if (user.is_admin) {
          postsResponse = await postsAPI.getAdminPosts();
        } else if (user.is_manager) {
          postsResponse = await postsAPI.getAdminPosts();
        } else {
          postsResponse = await postsAPI.getUserPosts();
        }
        
        // Fetch users if admin or manager
        let usersResponse = null;
        if (user.can_manage_users) {
          usersResponse = await usersAPI.getAllUsers();
        }
        
        // Calculate stats
        const posts = postsResponse?.data || [];
        const users = usersResponse?.data || [];
        
        const statsData = {
          totalPosts: posts.length || 0,
          totalManagers: users.filter(u => u.role === 'manager').length || 0,
          totalDraftPosts: posts.filter(p => p.status === 'draft').length || 0,
          totalApprovedPosts: posts.filter(p => p.status === 'published').length || 0,
          totalComments: posts.reduce((sum, post) => sum + (post.comment_count || 0), 0) || 0
        };
        
        setStats(statsData);
        setRecentPosts(Array.isArray(posts) ? posts.slice(0, 5) : []);
        setRecentUsers(Array.isArray(users) ? users.slice(0, 5) : []);
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const statsCards = [
    { 
      label: 'Total Posts', 
      value: stats.totalPosts, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      )
    },
    { 
      label: 'Total Managers', 
      value: stats.totalManagers, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    { 
      label: 'Draft Posts', 
      value: stats.totalDraftPosts, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )
    },
    { 
      label: 'Approved Posts', 
      value: stats.totalApprovedPosts, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <polyline points="9,12 12,15 17,10"/>
        </svg>
      )
    },
    { 
      label: 'Total Comments', 
      value: stats.totalComments, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user.first_name || user.username}</h1>
        <p className="dashboard-subtitle">Here's what's happening with your blog today.</p>
      </div>
      
      <div className="dashboard-stats">
        {statsCards.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="flex items-center gap-4">
              <div className="text-primary-color">{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-main">
        <div className="card">
          <div className="card-header">
            <h3>Recent Posts</h3>
          </div>
          <div className="card-body">
            {recentPosts.length > 0 ? (
              <div className="users-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.title || 'Untitled'}</td>
                        <td>{typeof post.author_name === 'string' ? post.author_name : 
                             typeof post.author === 'string' ? post.author : 
                             post.author?.username || 'Unknown Author'}</td>
                        <td>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown Date'}</td>
                        <td>
                          <span className={`badge badge-${(post.status || 'draft').toLowerCase() === 'published' ? 'success' : 'warning'}`}>
                            {post.status || 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No posts found.</p>
            )}
          </div>
        </div>
      </div>
      
      {user.can_manage_users && (
        <div className="dashboard-sidebar mt-4">
          <div className="card">
            <div className="card-header">
              <h3>Recent Users</h3>
            </div>
            <div className="card-body">
              {recentUsers.length > 0 ? (
                <div className="users-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div>
                              <div className="font-medium">{userItem.first_name || ''} {userItem.last_name || ''}</div>
                              <div className="text-sm text-gray-500">{userItem.email || 'No email'}</div>
                            </div>
                          </td>
                          <td>
                            {userItem.role === 'manager' ? (
                              <span className="badge badge-primary">Manager</span>
                            ) : userItem.role === 'admin' ? (
                              <span className="badge badge-warning">Admin</span>
                            ) : (
                              <span className="badge badge-warning">User</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No users found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 