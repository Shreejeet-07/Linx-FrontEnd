import { useState, useEffect } from 'react';
import { getAllUsers, adminDeleteUser, adminDeleteLink } from '../store';
import AppNav from '../components/AppNav';
import './AdminDashboard.css';

function getRawDB() {
  try { return JSON.parse(localStorage.getItem('linx_db')) || {}; }
  catch { return {}; }
}

export default function AdminDashboard({ user, onLogout, onViewProfile }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('users');
  const [dbView, setDbView] = useState('users');   // 'users' | 'links' | 'raw'
  const [rawDB, setRawDB] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUsers(getAllUsers());
    setRawDB(getRawDB());
  }, []);

  function refreshDB() {
    setUsers(getAllUsers());
    setRawDB(getRawDB());
  }

  function removeUser(id) {
    if (!window.confirm('Delete this user and all their links?')) return;
    adminDeleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setRawDB(getRawDB());
  }

  function removeLink(userId, linkId) {
    adminDeleteLink(userId, linkId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, links: u.links.filter(l => l.id !== linkId) } : u));
    setRawDB(getRawDB());
  }

  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(rawDB, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const allLinks = users.flatMap(u => u.links.map(l => ({ ...l, ownerUsername: u.username, ownerId: u.id })));
  const totalLinks = users.reduce((s, u) => s + u.links.length, 0);
  const totalClicks = users.reduce((s, u) => s + u.links.reduce((ls, l) => ls + l.clicks, 0), 0);

  const NAV = [
    ['users', '👥', 'Users'],
    ['database', '🗄️', 'Database'],
  ];

  return (
    <div className="admin-layout">
      <AppNav user={user} currentPage="admin" onNavigate={() => {}} onLogout={onLogout} />

      <div className="admin-content">
        {/* ADMIN TAB BAR */}
        <div className="admin-tabbar">
          {NAV.map(([id, icon, label]) => (
            <button key={id} className={`admin-tabbar-item${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
              <span>{icon}</span> {label}
            </button>
          ))}
          <div className="admin-tabbar-stats">
            <span>{users.length} users</span>
            <span>{totalLinks} links</span>
            <span>{totalClicks} clicks</span>
          </div>
        </div>

        {/* MAIN */}
        <main className="admin-main">

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
            <div className="admin-header">
              <h1>All Users</h1>
              <p>Full oversight of all influencers and their links</p>
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
              {filtered.length === 0 && <div className="admin-empty">{users.length === 0 ? 'No influencers have signed up yet.' : 'No results found.'}</div>}
              {filtered.map(u => (
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
                      <span className="tag tag-muted">{u.links.length} links</span>
                      <span className="tag tag-green">{u.links.reduce((s, l) => s + l.clicks, 0)} clicks</span>
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
                      {u.links.length === 0 && <p className="admin-no-links">This user has no links yet.</p>}
                      {u.links.map(link => (
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

        {/* ── DATABASE TAB ── */}
        {tab === 'database' && (
          <>
            <div className="admin-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1>Database Viewer</h1>
                <p>Live view of all data stored in localStorage</p>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={refreshDB}>↻ Refresh</button>
            </div>

            {/* DB sub-tabs */}
            <div className="db-tabs">
              {[['users', '👥 Users Table'], ['links', '🔗 Links Table'], ['raw', '{ } Raw JSON']].map(([id, label]) => (
                <button key={id} className={`db-tab${dbView === id ? ' active' : ''}`} onClick={() => setDbView(id)}>{label}</button>
              ))}
            </div>

            {/* USERS TABLE */}
            {dbView === 'users' && (
              <div className="db-table-wrap">
                <div className="db-table-meta">{rawDB.users?.length || 0} total records in <code>users</code> collection</div>
                <div className="db-table-scroll">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Avatar</th>
                        <th>Bio</th>
                        <th>Links</th>
                        <th>Total Clicks</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rawDB.users || []).map(u => (
                        <tr key={u.id}>
                          <td><code className="db-id">{u.id}</code></td>
                          <td><strong>@{u.username}</strong></td>
                          <td>{u.email}</td>
                          <td><span className={`tag ${u.role === 'admin' ? 'tag-red' : 'tag-green'}`} style={{ fontSize: '0.68rem' }}>{u.role}</span></td>
                          <td style={{ textAlign: 'center', fontSize: '1.2rem' }}>{u.avatar}</td>
                          <td className="db-bio">{u.bio || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                          <td style={{ textAlign: 'center' }}>{u.links.length}</td>
                          <td style={{ textAlign: 'center' }}>{u.links.reduce((s, l) => s + l.clicks, 0)}</td>
                          <td className="db-date">{new Date(u.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LINKS TABLE */}
            {dbView === 'links' && (
              <div className="db-table-wrap">
                <div className="db-table-meta">{allLinks.length} total records in <code>links</code> collection</div>
                <div className="db-table-scroll">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Owner</th>
                        <th>Icon</th>
                        <th>Title</th>
                        <th>URL</th>
                        <th>Clicks</th>
                        <th>Active</th>
                        <th>Order</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allLinks.length === 0 && (
                        <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No links yet.</td></tr>
                      )}
                      {allLinks.map(l => (
                        <tr key={l.id}>
                          <td><code className="db-id">{l.id}</code></td>
                          <td><strong>@{l.ownerUsername}</strong></td>
                          <td style={{ textAlign: 'center', fontSize: '1.2rem' }}>{l.icon}</td>
                          <td>{l.title}</td>
                          <td><a href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noreferrer" className="db-link">{l.url} ↗</a></td>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>{l.clicks}</td>
                          <td style={{ textAlign: 'center' }}><span className={`tag ${l.active ? 'tag-green' : 'tag-red'}`} style={{ fontSize: '0.68rem' }}>{l.active ? 'Yes' : 'No'}</span></td>
                          <td style={{ textAlign: 'center' }}>{l.order}</td>
                          <td className="db-date">{new Date(l.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RAW JSON */}
            {dbView === 'raw' && (
              <div className="db-raw-wrap">
                <div className="db-raw-toolbar">
                  <span className="db-table-meta" style={{ margin: 0 }}>Full <code>linx_db</code> localStorage key</span>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={copyJSON}>
                    {copied ? '✅ Copied!' : '📋 Copy JSON'}
                  </button>
                </div>
                <pre className="db-raw">{JSON.stringify(rawDB, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </main>
      </div>
    </div>
  );
}
