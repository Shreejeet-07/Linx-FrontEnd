import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Leaderboard from './pages/Leaderboard';
import ProfileView from './pages/ProfileView';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import SpaceCursor from './components/SpaceCursor';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    // Check for public profile link: ?user=ID
    const params = new URLSearchParams(window.location.search);
    const publicUserId = params.get('user');
    if (publicUserId) {
      setProfileId(publicUserId);
      setPage('profile');
      return;
    }

    const saved = localStorage.getItem('linx_session');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setPage(u.role === 'admin' ? 'admin' : 'dashboard');
      // Fetch fresh user data from backend to get latest photo/profile
      import('./store').then(({ getMe }) => {
        getMe().then(fresh => {
          if (fresh) {
            const updated = { ...u, ...fresh, id: fresh.id || fresh._id };
            localStorage.setItem('linx_session', JSON.stringify(updated));
            setUser(updated);
          }
        });
      });
    }
  }, []);

  function handleAuth(userData) {
    const u = { ...userData, profileTheme: userData.profileTheme || 'default' };
    localStorage.setItem('linx_session', JSON.stringify(u));
    setUser(u);
    setPage(u.role === 'admin' ? 'admin' : 'dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('linx_session');
    localStorage.removeItem('linx_token');
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

  function handleNavigate(dest) {
    if (dest === 'dashboard') setPage('dashboard');
    else if (dest === 'explore') setPage('explore');
    else if (dest === 'leaderboard') setPage('leaderboard');
    else if (dest === 'profile') setPage('profile-edit');
    else if (dest === 'notifications') setPage('notifications');
    else if (dest === 'admin') setPage('admin');
    else if (dest === 'landing') setPage('landing');
  }

  const navProps = { user, onLogout: handleLogout, setUser: handleSetUser, onNavigate: handleNavigate };

  let content;

  if (!user) {
    if (page === 'explore') {
      content = <Explore onViewProfile={openProfile} onBack={() => setPage('landing')} onAuth={handleAuth} />;
    } else if (page === 'leaderboard') {
      content = <Leaderboard onViewProfile={openProfile} onBack={() => setPage('landing')} onAuth={handleAuth} />;
    } else if (page === 'profile' && profileId) {
      content = <ProfileView userId={profileId} onBack={() => setPage('explore')} isGuest />;
    } else {
      content = <Landing onAuth={handleAuth} onBrowse={() => setPage('explore')} onLeaderboard={() => setPage('leaderboard')} user={null} />;
    }
  } else if (user.role === 'admin') {
    if (page === 'landing') {
      content = <Landing onAuth={handleAuth} onBrowse={() => setPage('explore')} onLeaderboard={() => setPage('leaderboard')} user={user} />;
    } else if (page === 'profile' && profileId) {
      content = <ProfileView userId={profileId} onBack={() => setPage('admin')} isGuest />;
    } else if (page === 'explore') {
      content = <Explore onViewProfile={openProfile} onBack={() => setPage('admin')} onAuth={handleAuth} currentPage="explore" {...navProps} />;
    } else if (page === 'leaderboard') {
      content = <Leaderboard onViewProfile={openProfile} onBack={() => setPage('admin')} onAuth={handleAuth} currentPage="leaderboard" {...navProps} />;
    } else if (page === 'notifications') {
      content = <NotificationsPage currentPage="notifications" {...navProps} />;
    } else {
      content = <AdminDashboard user={user} onLogout={handleLogout} onViewProfile={openProfile} onGoToLanding={() => setPage('landing')} onNavigate={handleNavigate} />;
    }
  } else {
    if (page === 'profile' && profileId) {
      content = <ProfileView userId={profileId} onBack={() => setPage('explore')} isGuest />;
    } else if (page === 'explore') {
      content = <Explore onViewProfile={openProfile} onBack={() => setPage('dashboard')} onAuth={handleAuth} currentPage="explore" {...navProps} />;
    } else if (page === 'leaderboard') {
      content = <Leaderboard onViewProfile={openProfile} onBack={() => setPage('dashboard')} onAuth={handleAuth} currentPage="leaderboard" {...navProps} />;
    } else if (page === 'profile-edit') {
      content = <ProfilePage currentPage="profile" {...navProps} />;
    } else if (page === 'notifications') {
      content = <NotificationsPage currentPage="notifications" {...navProps} />;
    } else {
      content = <Dashboard currentPage="dashboard" {...navProps} />;
    }
  }

  return (
    <>
      <SpaceCursor />
      {content}
    </>
  );
}
