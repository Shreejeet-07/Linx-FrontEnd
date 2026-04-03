import { useState, useEffect } from 'react';
import { getLinks, addLink, updateLink, deleteLink, trackClick } from '../store';
import AppNav from '../components/AppNav';
import './Dashboard.css';

export default function Dashboard({ user, onLogout, setUser, currentPage, onNavigate }) {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ title: '', url: '', icon: '🔗' });
  const [editId, setEditId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPage, setCopiedPage] = useState(false);

  const myPageUrl = `${window.location.origin}/?user=${user.id}`;

  useEffect(() => {
    getLinks(user.id).then(setLinks);
  }, [user.id]);

  useEffect(() => {
    const refresh = () => getLinks(user.id).then(setLinks);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [user.id]);

  async function saveLink(e) {
    e.preventDefault();
    if (!form.title || !form.url) return;
    if (editId) {
      const updated = await updateLink(user.id, editId, form);
      setLinks(updated);
      setEditId(null);
    } else {
      const updated = await addLink(user.id, form);
      setLinks(updated);
    }
    setForm({ title: '', url: '', icon: '🔗' });
  }

  async function removeLink(id) {
    const updated = await deleteLink(user.id, id);
    setLinks(updated);
  }

  async function toggleLink(id, active) {
    const updated = await updateLink(user.id, id, { active: !active });
    setLinks(updated);
  }

  async function handleClick(link) {
    if (!link.active) return;
    window.open(link.url.startsWith('http') ? link.url : `https://${link.url}`, '_blank');
    await trackClick(user.id, link.id);
    getLinks(user.id).then(setLinks);
  }

  function startEdit(link) {
    setEditId(link.id);
    setForm({ title: link.title, url: link.url, icon: link.icon });
  }

  function copyLink(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyPageLink() {
    navigator.clipboard.writeText(myPageUrl);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="dash-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="dash-main">
        <div className="my-page-banner">
          <div className="my-page-banner-left">
            <div className="my-page-banner-icon">🔗</div>
            <div>
              <div className="my-page-banner-label">Your Linx Page</div>
              <div className="my-page-banner-url">{myPageUrl}</div>
            </div>
          </div>
          <button className={`btn my-page-copy-btn${copiedPage ? ' copied' : ''}`} onClick={copyPageLink}>
            {copiedPage ? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        <div className="dash-stats">
          <div className="dash-stat-card"><div className="dash-stat-label">Total Links</div><div className="dash-stat-val">{links.length}</div></div>
          <div className="dash-stat-card"><div className="dash-stat-label">Total Clicks</div><div className="dash-stat-val">{totalClicks}</div></div>
          <div className="dash-stat-card"><div className="dash-stat-label">Active Links</div><div className="dash-stat-val">{links.filter(l => l.active).length}</div></div>
        </div>

        <div className="card dash-form-card">
          <h3>{editId ? 'Edit Link' : 'Add New Link'}</h3>
          <form className="dash-form" onSubmit={saveLink}>
            <div className="dash-form-row">
              <input className="dash-icon-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength={2} placeholder="🔗" />
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Link title (e.g. My Portfolio)" required />
            </div>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL (e.g. https://yoursite.com)" required />
            <div className="dash-form-actions">
              <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Add Link'}</button>
              {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm({ title: '', url: '', icon: '🔗' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="dash-links-list">
          {links.length === 0 && <div className="dash-empty">No links yet. Add your first one above ↑</div>}
          {links.map((link, i) => (
            <div className={`dash-link-row${link.active ? '' : ' inactive'}`} key={link.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="dash-link-icon">{link.icon}</div>
              <div className="dash-link-info">
                <div className="dash-link-title">{link.title}</div>
                <div className="dash-link-url">{link.url}</div>
              </div>
              <div className="dash-link-clicks">{link.clicks} clicks</div>
              <div className="dash-link-actions">
                <button className={`dash-toggle${link.active ? ' on' : ''}`} onClick={() => toggleLink(link.id, link.active)} title={link.active ? 'Disable' : 'Enable'} />
                <button className={`btn btn-ghost copy-link-btn${copiedId === link.id ? ' copy-link-copied' : ''}`} onClick={() => copyLink(link.url.startsWith('http') ? link.url : `https://${link.url}`, link.id)} title="Copy URL">
                  {copiedId === link.id ? '✅' : '📋'}
                </button>
                <button className="btn btn-ghost" onClick={() => startEdit(link)}>✏️</button>
                <button className="btn btn-danger" style={{ borderRadius: 10, padding: '0.4rem 0.7rem', fontSize: '0.8rem' }} onClick={() => removeLink(link.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-preview-wrap">
          <div className="prev-page">
            <div className="prev-banner">
              <div className="prev-banner-blob1" /><div className="prev-banner-blob2" /><div className="prev-banner-blob3" />
              <div className="prev-banner-grid" />
            </div>
            <div className="prev-card">
              <div className="prev-avatar-ring">
                <div className="prev-avatar">
                  {user.photo ? <img src={user.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (user.avatar || '🌟')}
                </div>
              </div>
              <div className="prev-name">@{user.username}</div>
              {user.bio && <div className="prev-bio">{user.bio}</div>}
              <div className="prev-links">
                {links.filter(l => l.active).length === 0 && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No active links yet.</p>
                )}
                {links.filter(l => l.active).map(link => (
                  <button key={link.id} className="prev-link" onClick={() => handleClick(link)}>
                    <span className="prev-link-icon">{link.icon}</span>
                    <span>{link.title}</span>
                    <span className="prev-link-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
