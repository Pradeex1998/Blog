import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// CSS is now imported via global styles

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Blog</h2>
      </div>
      <nav className="sidebar-nav">
        {(user?.is_admin || user?.is_manager) && (
          <div className="sidebar-nav-item">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
              <svg className="sidebar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Dashboard
            </NavLink>
          </div>
        )}
        <div className="sidebar-nav-item">
          <NavLink to="/posts" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
            <svg className="sidebar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Posts Overview
          </NavLink>
        </div>
        <div className="sidebar-nav-item">
          <NavLink to="/my-posts" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
            <svg className="sidebar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4"/>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            </svg>
            My Posts
          </NavLink>
        </div>
        {(user?.is_admin || user?.is_manager) && (
          <div className="sidebar-nav-item">
            <NavLink to="/users" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
              <svg className="sidebar-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-2-2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Manage Users
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 