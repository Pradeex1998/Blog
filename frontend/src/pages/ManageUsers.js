import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
// CSS is now imported via global styles
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tableRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers();
        setUsers(response?.data || []);
      } catch (err) {
        setError('Failed to load users');
        console.error('Users error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!loading && users.length > 0 && tableRef.current) {
      // Destroy previous DataTable instance if exists
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      $(tableRef.current).DataTable({
        responsive: true,
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        language: {
          search: 'Search:',
          lengthMenu: 'Show _MENU_ entries',
          info: 'Showing _START_ to _END_ of _TOTAL_ users',
        },
      });
    }
    // Cleanup on unmount
    return () => {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [loading, users]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      await usersAPI.updateUser(userId, { ...userToUpdate, role: newRole });
      // Refresh users
      const response = await usersAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to update user role');
      console.error('Role update error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user');
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-3">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <h2 className="mb-0">Manage Users</h2> */}
        <span className="badge bg-primary fs-6">{users.length} users</span>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table ref={tableRef} className="table table-striped table-bordered align-middle" style={{width: '100%'}}>
              <thead className="table-light">
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={
                          !currentUser.can_manage_users || 
                          user.id === currentUser.id ||
                          (user.role === 'admin' && !currentUser.is_admin)
                        }
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        {currentUser.is_admin && (
                          <option value="admin">Admin</option>
                        )}
                      </select>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={
                          !currentUser.can_manage_users || 
                          user.id === currentUser.id ||
                          (user.role === 'admin' && !currentUser.is_admin)
                        }
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers; 