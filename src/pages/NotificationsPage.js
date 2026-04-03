import { useState, useEffect } from 'react';
import { getNotifications, markNotificationsRead, clearNotifications } from '../store';
import AppNav from '../components/AppNav';
import './NotificationsPage.css';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage({ user, onLogout, setUser, currentPage, onNavigate }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    getNotifications().then(n => {
      setNotifs(n);
      markNotificationsRead();
    });
  }, [user.id]);

  async function handleClear() {
    await clearNotifications();
    setNotifs([]);
  }

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="notif-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="notif-main">
        <div className="notif-header">
          <div>
            <h1>Notifications</h1>
            <p>{notifs.length === 0 ? 'No activity yet' : `${notifs.length} total · ${unread} unread`}</p>
          </div>
          {notifs.length > 0 && (
            <button className="btn btn-secondary notif-clear-btn" onClick={handleClear}>
              🗑 Clear all
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <div className="notif-empty-title">All quiet here</div>
            <div className="notif-empty-sub">When visitors click your links, you'll see it here in real time.</div>
          </div>
        ) : (
          <div className="notif-list">
            {notifs.map((n, i) => (
              <div
                key={n.id}
                className={`notif-item${n.read ? '' : ' unread'}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="notif-dot" />
                <div className="notif-icon">{n.linkIcon || '🔗'}</div>
                <div className="notif-body">
                  {n.type === 'announcement'
                    ? <div className="notif-text"><strong>Announcement:</strong> {n.linkTitle}</div>
                    : <div className="notif-text">Someone clicked <span className="notif-link-name">"{n.linkTitle}"</span></div>
                  }
                  <div className="notif-time">{timeAgo(n.time)}</div>
                </div>
                <div className="notif-badge">{n.type === 'announcement' ? '📢 admin' : '👆 click'}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
