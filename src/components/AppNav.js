import { useEffect, useState } from 'react';
import { getNotifications } from '../store';
import ThemeSwitcher from './ThemeSwitcher';
import './AppNav.css';

export default function AppNav({ user, currentPage, onNavigate, onLogout }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function refresh() {
      const n = await getNotifications();
      setUnread(Array.isArray(n) ? n.filter(x => !x.read).length : 0);
    }
    refresh();
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [user.id]);

  const pages = [
    { id: 'dashboard',      icon: '🔗', label: 'My Links'      },
    { id: 'explore',        icon: '🌍', label: 'Explore'        },
    { id: 'notifications',  icon: '🔔', label: 'Notifications', badge: unread },
    { id: 'profile',        icon: '👤', label: 'Profile'        },
  ];

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
      </nav>

      <div className="appnav-bottom">
        <ThemeSwitcher />
        <button className="appnav-logout" onClick={onLogout}>← Log out</button>
      </div>
    </aside>
  );
}
