import { useEffect, useState } from 'react';
import { getNotifications, getLinks } from '../store';
import ThemeSwitcher from './ThemeSwitcher';
import './AppNav.css';

export default function AppNav({ user, currentPage, onNavigate, onLogout }) {
  const [unread, setUnread] = useState(0);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    async function refresh() {
      const n = await getNotifications();
      setNotifications(Array.isArray(n) ? n : []);
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

  // Build 7-day chart data from notifications
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toDateString(), count: 0 };
  });
  notifications.filter(n => n.type === 'click').forEach(n => {
    const d = new Date(n.time).toDateString();
    const day = chartDays.find(x => x.date === d);
    if (day) day.count++;
  });
  const chartMax = Math.max(...chartDays.map(d => d.count), 1);
  const chartTotal = chartDays.reduce((s, d) => s + d.count, 0);

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
            <button className="appnav-item appnav-stats-toggle" onClick={() => setStatsOpen(o => !o)}>
              <span className="appnav-icon">📊</span>
              <span className="appnav-label">Your Stats</span>
              <span className="appnav-stats-arrow">{statsOpen ? '▲' : '▼'}</span>
            </button>

            {statsOpen && (
              <div className="appnav-stats">
                <div className="appnav-stats-row">
                  <div className="appnav-stat">
                    <div className="appnav-stat-val">{stats.links}</div>
                    <div className="appnav-stat-label">Links</div>
                  </div>
                  <div className="appnav-stat">
                    <div className="appnav-stat-val">{stats.clicks}</div>
                    <div className="appnav-stat-label">Clicks</div>
                  </div>
                  <div className="appnav-stat">
                    <div className="appnav-stat-val">{stats.views}</div>
                    <div className="appnav-stat-label">Views</div>
                  </div>
                </div>

                {chartTotal > 0 && (
                  <div className="appnav-chart">
                    <div className="appnav-chart-header">
                      <span>📈 Last 7 Days</span>
                      <span>{chartTotal} total</span>
                    </div>
                    <div className="appnav-chart-bars">
                      {chartDays.map((d, i) => (
                        <div className="appnav-chart-col" key={i}>
                          <div className="appnav-chart-count">{d.count > 0 ? d.count : ''}</div>
                          <div className="appnav-chart-bar-wrap">
                            <div className="appnav-chart-bar" style={{ height: `${(d.count / chartMax) * 100}%`, animationDelay: `${i * 0.07}s` }} />
                          </div>
                          <div className="appnav-chart-label">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
