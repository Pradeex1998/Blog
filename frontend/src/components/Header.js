import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// CSS is now imported via global styles

const Header = ({ title, user = {} }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user display name safely
  const getUserDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.username) {
      return user.username;
    }
    return 'User';
  };

  const displayName = getUserDisplayName();
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-logo">{title}</h1>
        <div className="header-user">
          <div className="header-user-avatar">{avatarInitial}</div>
          <div className="header-user-menu">
            <button className="header-user-button">
              <span>{displayName}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 