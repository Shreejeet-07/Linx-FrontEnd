import { useState, useEffect } from 'react';
import { getAllInfluencers } from '../store';
import AuthModal from '../components/AuthModal';
import AppNav from '../components/AppNav';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ onViewProfile, onBack, onAuth, user, onNavigate, onLogout, currentPage }) {
  const [creators, setCreators] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllInfluencers().then(data => {
      const sorted = [...data].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));
      setCreators(sorted);
      setLoading(false);
    });
  }, []);

  return (
    <div className={`lb-layout${user ? ' lb-with-sidebar' : ''}`}>
      {user
        ? <AppNav user={user} currentPage={currentPage || 'leaderboard'} onNavigate={onNavigate} onLogout={onLogout} />
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

      <div className="lb-body">
        <div className="lb-header">
          <div className="tag tag-accent">🏆 Rankings</div>
          <h1>Leaderboard</h1>
          <p>Top creators ranked by total link clicks. The more clicks, the higher the rank.</p>
        </div>

        {loading ? (
          <div className="lb-loading">Loading rankings...</div>
        ) : creators.length === 0 ? (
          <div className="lb-empty">No creators yet. Be the first to sign up!</div>
        ) : (
          <div className="lb-list">
            {/* TOP 3 PODIUM */}
            {creators.length >= 1 && (
              <div className="lb-podium">
                {creators.slice(0, 3).map((c, i) => (
                  <div key={c.id} className={`lb-podium-card lb-podium-${i + 1}`} onClick={() => onViewProfile(c.id)}>
                    <div className="lb-podium-medal">{MEDALS[i]}</div>
                    <div className="lb-podium-avatar">
                      {c.photo
                        ? <img src={c.photo} alt={c.username} />
                        : (c.avatar || '🌟')}
                    </div>
                    <div className="lb-podium-name">@{c.username}</div>
                    <div className="lb-podium-clicks">{c.totalClicks || 0} clicks</div>
                  </div>
                ))}
              </div>
            )}

            {/* REST OF THE LIST */}
            {creators.slice(3).map((c, i) => (
              <div key={c.id} className="lb-row" onClick={() => onViewProfile(c.id)}>
                <div className="lb-rank">#{i + 4}</div>
                <div className="lb-row-avatar">
                  {c.photo
                    ? <img src={c.photo} alt={c.username} />
                    : (c.avatar || '🌟')}
                </div>
                <div className="lb-row-info">
                  <div className="lb-row-name">@{c.username}</div>
                  {c.bio && <div className="lb-row-bio">{c.bio}</div>}
                </div>
                <div className="lb-row-clicks">
                  <span>👆</span> {c.totalClicks || 0} clicks
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onToggle={setModal} onAuth={onAuth} />}
    </div>
  );
}
