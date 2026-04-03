import { useState, useEffect } from 'react';
import { getAllUsers, adminDeleteUser, adminDeleteLink, broadcastAnnouncement } from '../store';
import AppNav from '../components/AppNav';
import './AdminDashboard.css';

export default function AdminDashboard({ user, onLogout, onViewProfile, onGoToLanding }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('users');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  useEffect(() => {
    getAllUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  async function removeUser(id) {
    if (!window.confirm('Delete this user and all their links?')) return;
    await adminDeleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function removeLink(userId, linkId) {
    await adminDeleteLink(userId, linkId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, links: u.links.filter(l => l.id !== linkId) } : u));
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalLinks = users.reduce((s, u) => s + (u.links?.length || 0), 0);
  const totalClicks = users.reduce((s, u) => s + (u.links || []).reduce((ls, l) => ls + l.clicks, 0), 0);

  function handleAdminNav(dest) {
    if (dest === 'users') setTab('users');
    else if (dest === 'broadcast') setTab('broadcast');
    else if (dest === 'landing') onGoToLanding();
    else if (dest === 'explore' || dest === 'leaderboard' || dest === 'notifications') onGoToLanding();
  }
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastStatus('sending');
    const result = await broadcastAnnouncement(broadcastMsg);
    if (result.success) {
      setBroadcastStatus('sent');
      setBroadcastMsg('');
      setTimeout(() => setBroadcastStatus(''), 3000);
    } else {
      setBroadcastStatus('error');
    }
  }

  return (
    <div className="admin-layout">
      <AppNav user={user} currentPage={tab} onNavigate={handleAdminNav} onLogout={onLogout} />

      <div className="admin-content">
        <main className="admin-main">
          {tab === 'users' && (
            <>
              <div className="admin-header">
                <h1>All Users</h1>
                <p>{users.length} users · {totalLinks} links · {totalClicks} clicks</p>
              </div>

              <div className="admin-stats">
                {[['👥', 'Total Influencers', users.length], ['🔗', 'Total Links', totalLinks], ['👆', 'Total Clicks', totalClicks]].map(([icon, label, val]) => (
                  <div className="admin-stat-card" key={label}>
                    <div className="admin-stat-icon">{icon}</div>
                    <div>
                      <div className="admin-stat-label">{label}</div>
                      <div className="admin-stat-val">{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-search-row">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by username or email..." className="admin-search" />
              </div>

              <div className="admin-users">
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <div className="admin-user-card" key={i} style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="skel" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skel" style={{ height: 12, width: '30%', marginBottom: 8 }} />
                        <div className="skel" style={{ height: 10, width: '50%' }} />
                      </div>
                      <div className="skel" style={{ height: 10, width: '10%' }} />
                    </div>
                  </div>
                ))}
                {!loading && filtered.length === 0 && <div className="admin-empty">{users.length === 0 ? 'No influencers have signed up yet.' : 'No results found.'}</div>}
                {!loading && filtered.map(u => (
                  <div className="admin-user-card" key={u.id}>
                    <div className="admin-user-header" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                      <div className="admin-user-left">
                        <div className="admin-user-avatar">
                          {u.photo
                            ? <img src={u.photo} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : (u.avatar || '🌟')}
                        </div>
                        <div>
                          <div className="admin-user-name">@{u.username}</div>
                          <div className="admin-user-email">{u.email}</div>
                        </div>
                      </div>
                      <div className="admin-user-meta">
                        <span className="tag tag-muted">{u.links?.length || 0} links</span>
                        <span className="tag tag-green">{(u.links || []).reduce((s, l) => s + l.clicks, 0)} clicks</span>
                        <span className="admin-joined">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', borderRadius: 10 }}
                          onClick={e => { e.stopPropagation(); onViewProfile(u.id); }}>👁 View Page</button>
                        <button className="btn btn-danger" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', borderRadius: 10 }}
                          onClick={e => { e.stopPropagation(); removeUser(u.id); }}>🗑 Delete User</button>
                        <span className="admin-expand">{expanded === u.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded === u.id && (
                      <div className="admin-user-links">
                        {(!u.links || u.links.length === 0) && <p className="admin-no-links">This user has no links yet.</p>}
                        {(u.links || []).map(link => (
                          <div className="admin-link-row" key={link.id}>
                            <span className="admin-link-icon">{link.icon}</span>
                            <div className="admin-link-info">
                              <div className="admin-link-title">{link.title}</div>
                              <a href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noreferrer" className="admin-link-url">{link.url} ↗</a>
                            </div>
                            <span className="tag tag-muted" style={{ fontSize: '0.7rem' }}>{link.clicks} clicks</span>
                            <span className={`tag ${link.active ? 'tag-green' : 'tag-red'}`} style={{ fontSize: '0.7rem' }}>{link.active ? 'Active' : 'Off'}</span>
                            <button className="btn btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', borderRadius: 8 }}
                              onClick={() => removeLink(u.id, link.id)}>🗑</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'broadcast' && (
            <>
              <div className="admin-header">
                <h1>Broadcast Announcement</h1>
                <p>Send a notification to all users at once</p>
              </div>
              <div className="card" style={{ maxWidth: 600, padding: '2rem' }}>
                <form onSubmit={handleBroadcast}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.88rem' }}>Message</label>
                    <textarea
                      value={broadcastMsg}
                      onChange={e => setBroadcastMsg(e.target.value)}
                      placeholder="Write your announcement here..."
                      rows={4}
                      style={{ width: '100%', borderRadius: 12, padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={broadcastStatus === 'sending' || !broadcastMsg.trim()}>
                      {broadcastStatus === 'sending' ? 'Sending…' : '📢 Send to All Users'}
                    </button>
                    {broadcastStatus === 'sent' && <span style={{ color: 'green', fontSize: '0.88rem' }}>✅ Sent to {users.length} users!</span>}
                    {broadcastStatus === 'error' && <span style={{ color: 'red', fontSize: '0.88rem' }}>❌ Failed to send</span>}
                  </div>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
