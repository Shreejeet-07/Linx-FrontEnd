import { useState, useEffect } from 'react';
import { getAllInfluencers } from '../store';
import AuthModal from '../components/AuthModal';
import AppNav from '../components/AppNav';
import './Explore.css';

export default function Explore({ onViewProfile, onBack, onAuth, user, onNavigate, onLogout, currentPage }) {
  const [influencers, setInfluencers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    getAllInfluencers().then(setInfluencers);
  }, []);

  const filtered = influencers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.bio || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`explore-layout${user ? ' explore-with-sidebar' : ''}`}>
      {user
        ? <AppNav user={user} currentPage={currentPage || 'explore'} onNavigate={onNavigate} onLogout={onLogout} />
        : (
          <nav className="explore-nav">
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <span className="explore-logo">Lin<span>x</span></span>
            <div className="explore-nav-right">
              <button className="btn btn-ghost" onClick={() => setModal('login')}>Log in</button>
              <button className="btn btn-primary" onClick={() => setModal('signup')}>Sign up →</button>
            </div>
          </nav>
        )
      }

      <div className="explore-body">
        <div className="explore-header">
          <div className="tag tag-accent">👥 Discover</div>
          <h1>Browse Creators</h1>
          <p>Explore link pages from influencers and creators. Click any card to view their links.</p>
          {!user && (
            <div className="explore-guest-badge">
              👁 You are browsing as a guest —{' '}
              <button onClick={() => setModal('signup')}>Sign up to create your own page →</button>
            </div>
          )}
        </div>

        <input
          className="explore-search"
          placeholder="🔍  Search creators by name or bio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtered.length === 0 && (
          <div className="explore-empty">
            {influencers.length === 0
              ? 'No creators have signed up yet. Be the first!'
              : 'No creators match your search.'}
          </div>
        )}

        <div className="explore-grid">
          {filtered.map(u => (
            <div className="explore-card" key={u.id} onClick={() => onViewProfile(u.id)}>
              <div className="explore-card-avatar">
                {u.photo
                  ? <img src={u.photo} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : (u.avatar || '🌟')}
              </div>
              <div className="explore-card-name">@{u.username}</div>
              {u.bio && <div className="explore-card-bio">{u.bio}</div>}
              <div className="explore-card-meta">
                <span className="tag tag-muted">{u.linkCount} links</span>
              </div>
              <div className="explore-card-cta">View Links →</div>
            </div>
          ))}
        </div>
      </div>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onToggle={setModal} onAuth={onAuth} />}
    </div>
  );
}
