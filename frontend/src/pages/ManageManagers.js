import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
// CSS is now imported via global styles

const ManageManagers = () => {
  const { user: currentUser } = useAuth();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers();
        // Filter to show only managers and admins
        const usersData = response?.data || [];
        const managersData = usersData.filter(user => 
          user.role === 'manager' || user.role === 'admin'
        );
        setManagers(managersData);
      } catch (err) {
        setError('Failed to load managers');
        console.error('Managers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const managerToUpdate = managers.find(u => u.id === userId);
      await usersAPI.updateUser(userId, { ...managerToUpdate, role: newRole });
      
      // Refresh managers
      const response = await usersAPI.getAllUsers();
      const managersData = response.data.filter(user => 
        user.role === 'manager' || user.role === 'admin'
      );
      setManagers(managersData);
    } catch (err) {
      setError('Failed to update manager role');
      console.error('Role update error:', err);
    }
  };

  const handleDeleteManager = async (userId) => {
    if (window.confirm('Are you sure you want to delete this manager?')) {
      try {
        await usersAPI.deleteUser(userId);
        setManagers(managers.filter(manager => manager.id !== userId));
      } catch (err) {
        setError('Failed to delete manager');
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading managers...</span>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Managers</h1>
        <p className="text-gray-600">Manage manager and admin accounts.</p>
      </div>
      
      {managers.length > 0 ? (
        <div className="users-table">
          <div className="table-header">
            <h2 className="table-title">Managers ({managers.length})</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td>
                    <div>
                      <div className="font-medium">{manager.first_name} {manager.last_name}</div>
                    </div>
                  </td>
                  <td>{manager.username}</td>
                  <td>{manager.email}</td>
                  <td>
                    <select
                      className="form-input"
                      value={manager.role}
                      onChange={(e) => handleRoleChange(manager.id, e.target.value)}
                      disabled={
                        !currentUser.is_admin || 
                        manager.id === currentUser.id
                      }
                    >
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(manager.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions-cell">
                      <button 
                        onClick={() => handleDeleteManager(manager.id)}
                        disabled={
                          !currentUser.is_admin || 
                          manager.id === currentUser.id
                        }
                        className="btn btn-danger btn-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-center">No managers found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageManagers; 