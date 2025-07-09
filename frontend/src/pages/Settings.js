import React from 'react';
// CSS is now imported via global styles

const Settings = () => (
  <div className="settings">
    <div className="settings-header">
      <h1 className="settings-title">Settings</h1>
    </div>
    <div className="settings-section">
      <h3 className="settings-section-title">Account Settings</h3>
      <p className="text-gray-600">This page is accessible to all roles. Here you can update your settings.</p>
    </div>
  </div>
);

export default Settings; 