import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageManagers from './pages/ManageManagers';
import ManageUsers from './pages/ManageUsers';
import PostsOverview from './pages/PostsOverview';
import CreatePost from './pages/CreatePost';
import BlogViewer from './pages/BlogViewer';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MyPosts from './pages/MyPosts';
// CSS is now imported via index.css

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Restrict normal users to only allowed pages
  if (user && user.role === 'user') {
    const allowedUserPaths = ['/posts', '/my-posts', '/blog', '/login', '/register'];
    if (!allowedUserPaths.includes(location.pathname)) {
      window.location.replace('/posts');
      return null;
    }
  }

  return (
    <div className="main-layout">
      {user && !isAuthPage && <Sidebar />}
      <div className={user && !isAuthPage ? "main-content" : "main-content-without-sidebar"}>
        {user && !isAuthPage && <Header title={getPageTitle(location.pathname)} user={user} />}
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/managers" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <ManageManagers />
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager']}>
                  <ManageUsers />
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/posts" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager', 'user']}>
                  <PostsOverview />
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/my-posts" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager', 'user']}>
                  <MyPosts />
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/create-post" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/blog" element={<BlogViewer />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  switch (pathname) {
    case '/': return 'Dashboard';
    case '/managers': return 'Manage Managers';
    case '/users': return 'Manage Users';
    case '/posts': return 'Posts Overview';
    case '/my-posts': return 'My Posts';
    case '/settings': return 'Settings';
    default: return 'Dashboard';
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App; 