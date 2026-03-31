import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ProfileView from './pages/ProfileView';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import SpaceCursor from './components/SpaceCursor';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');   // 'landing' | 'explore' | 'profile' | 'dashboard' | 'profile-edit' | 'admin'
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('linx_session');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setPage(u.role === 'admin' ? 'admin' : 'dashboard');
    }
  }, []);

  function handleAuth(userData) {
    localStorage.setItem('linx_session', JSON.stringify(userData));
    setUser(userData);
    setPage(userData.role === 'admin' ? 'admin' : 'dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('linx_session');
    setUser(null);
    setPage('landing');
  }

  function handleSetUser(updated) {
    localStorage.setItem('linx_session', JSON.stringify(updated));
    setUser(updated);
  }

  function openProfile(id) {
    setProfileId(id);
    setPage('profile');
  }

  // Navigate between authenticated pages
  function handleNavigate(dest) {
    if (dest === 'dashboard') setPage('dashboard');
    else if (dest === 'explore') setPage('explore');
    else if (dest === 'profile') setPage('profile-edit');
    else if (dest === 'notifications') setPage('notifications');
  }

  // Shared nav props for authenticated pages
  const navProps = {
    user,
    onLogout: handleLogout,
    setUser: handleSetUser,
    onNavigate: handleNavigate,
  };

  // Also show landing with admin context when admin navigates back
  const [landingUser, setLandingUser] = useState(() => {
    const saved = localStorage.getItem('linx_session');
    return saved ? JSON.parse(saved) : null;
  });

  if (!user) {
    // ── Guest routes ──
    if (page === 'explore') {
      content = (
        <Explore
          onViewProfile={openProfile}
          onBack={() => setPage('landing')}
          onAuth={handleAuth}
        />
      );
    } else if (page === 'profile' && profileId) {
      content = (
        <ProfileView
          userId={profileId}
          onBack={() => setPage('explore')}
          isGuest
        />
      );
    } else {
      content = (
        <Landing
          onAuth={handleAuth}
          onBrowse={() => setPage('explore')}
          user={user}
        />
      );
    }
  } else if (user.role === 'admin') {
    // ── Admin routes ──
    if (page === 'landing') {
      content = (
        <Landing
          onAuth={handleAuth}
          onBrowse={() => setPage('explore')}
          user={user}
        />
      );
    } else if (page === 'profile' && profileId) {
      content = (
        <ProfileView
          userId={profileId}
          onBack={() => setPage('admin')}
          isGuest
        />
      );
    } else {
      content = (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onViewProfile={openProfile}
        />
      );
    }
  } else {
    // ── Influencer routes ──
    if (page === 'profile' && profileId) {
      content = (
        <ProfileView
          userId={profileId}
          onBack={() => setPage('explore')}
          isGuest
        />
      );
    } else if (page === 'explore') {
      content = (
        <Explore
          onViewProfile={openProfile}
          onBack={() => setPage('dashboard')}
          onAuth={handleAuth}
          currentPage="explore"
          {...navProps}
        />
      );
    } else if (page === 'profile-edit') {
      content = (
        <ProfilePage currentPage="profile" {...navProps} />
      );
    } else if (page === 'notifications') {
      content = (
        <NotificationsPage currentPage="notifications" {...navProps} />
      );
    } else {
      content = (
        <Dashboard
          currentPage="dashboard"
          {...navProps}
        />
      );
    }
  }

  return (
    <>
      <SpaceCursor />
      {content}
    </>
  );
}
