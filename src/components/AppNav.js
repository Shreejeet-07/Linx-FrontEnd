import { useEffect, useState } from 'react';
import { getNotifications, getLinks } from '../store';
import ThemeSwitcher from './ThemeSwitcher';
import './AppNav.css';

export default function AppNav({ user, currentPage, onNavigate, onLogout }) {
  const [unread, setUnread] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function refresh() {
      const n = await getNotifications();
      setUnread(Array.isArray(n) ? n.filter(x => !x.read).length : 0);
    }
    refresh();
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [user.id]);

  useEffect(() => {
    if (user.role === 'admin') return;
    getLinks().then(links => {
      const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
      setStats({ links: links.length, clicks: totalClicks, views: user.profileViews || 0 });
    });
  }, [user.id, user.role, user.profileViews]);

  const isAdmin = user.role === 'admin';

  const pages = isAdmin ? [
    { id: 'users',        icon: '👥', label: 'Users'         },
    { id: 'broadcast',    icon: '📢', label: 'Broadcast'     },
    { id: 'explore',      icon: '🌍', label: 'Explore'       },
    { id: 'leaderboard',  icon: '🏆', label: 'Leaderboard'   },
    { id: 'notifications',icon: '🔔', label: 'Notifications', badge: unread },
    { id: 'landing',      icon: '🏠', label: 'Landing Page'  },
  ] : [
    { id: 'dashboard',    icon: '🔗', label: 'My Links'      },
    { id: 'explore',      icon: '🌍', label: 'Explore'       },
    { id: 'leaderboard',  icon: '🏆', label: 'Leaderboard'   },
    { id: 'notifications',icon: '🔔', label: 'Notifications', badge: unread },
    { id: 'profile',      icon: '👤', label: 'Profile'       },
  ];

  const aiItem = { id: 'ai', icon: '✨', label: 'AI', badge: '🔒' };

  return (
    <aside className="appnav">
      <div className="appnav-brand" onClick={() => onNavigate('dashboard')}>
        Lin<span>x</span>
      </div>

      <div className="appnav-profile" onClick={() => onNavigate('profile')}>
        <div className="appnav-avatar">
          {user.photo ? <img src={user.photo} alt="avatar" /> : (user.avatar || '🌟')}
        </div>
        <div className="appnav-user-info">
          <div className="appnav-username">@{user.username}</div>
          <div className="appnav-email">{user.email}</div>
        </div>
      </div>

      <nav className="appnav-links">
        {pages.map(p => (
          <button
            key={p.id}
            className={`appnav-item${currentPage === p.id ? ' active' : ''}`}
            onClick={() => onNavigate(p.id)}
          >
            <span className="appnav-icon">{p.icon}</span>
            <span className="appnav-label">{p.label}</span>
            {p.badge > 0 && <span className="appnav-badge">{p.badge}</span>}
          </button>
        ))}

        {/* Your Stats — between Profile and AI */}
        {!isAdmin && stats && (
          <>
            <button
              className={`appnav-item${currentPage === 'stats' ? ' active' : ''}`}
              onClick={() => onNavigate('stats')}
            >
              <span className="appnav-icon">📊</span>
              <span className="appnav-label">Your Stats</span>
            </button>

            <button
              className={`appnav-item${currentPage === aiItem.id ? ' active' : ''}`}
              onClick={() => onNavigate(aiItem.id)}
            >
              <span className="appnav-icon">{aiItem.icon}</span>
              <span className="appnav-label">{aiItem.label}</span>
              <span className="appnav-badge appnav-badge-lock">{aiItem.badge}</span>
            </button>
          </>
        )}

        {isAdmin && (
          <button
            className={`appnav-item${currentPage === aiItem.id ? ' active' : ''}`}
            onClick={() => onNavigate(aiItem.id)}
          >
            <span className="appnav-icon">{aiItem.icon}</span>
            <span className="appnav-label">{aiItem.label}</span>
            <span className="appnav-badge appnav-badge-lock">{aiItem.badge}</span>
          </button>
        )}
      </nav>

      <div className="appnav-bottom">
        <ThemeSwitcher />
        <button className="appnav-logout" onClick={onLogout}>← Log out</button>
      </div>
    </aside>
  );
}
