import { useState, useEffect } from 'react';
import { getPublicProfile, guestTrackClick } from '../store';
import { PROFILE_THEMES } from './ProfilePage';
import './ProfileView.css';

export default function ProfileView({ userId, onBack, isGuest }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => { setProfile(getPublicProfile(userId)); }, [userId]);

  function handleClick(link) {
    guestTrackClick(userId, link.id);
    window.open(link.url.startsWith('http') ? link.url : `https://${link.url}`, '_blank');
  }

  if (!profile) return (
    <div className="pv-layout">
      <button className="btn btn-ghost pv-back" onClick={onBack}>← Back</button>
      <div className="pv-not-found">Profile not found.</div>
    </div>
  );

  const theme = PROFILE_THEMES.find(t => t.id === profile.profileTheme) || PROFILE_THEMES[0];

  return (
    <div className="pv-layout" style={{ background: theme.bg }}>
      <div className="pv-bg-icons" aria-hidden="true">
        {['❤️','💬','🔗','📸','✨','🎵','🔥','💡','🌟','👾','📱','💎','🎯','🚀','💫'].map((icon, i) => (
          <span key={i} className="pv-bg-icon" style={{ '--i': i }}>{icon}</span>
        ))}
      </div>
      <div className="pv-topbar">
        <button className="btn btn-ghost" onClick={onBack}>← Back to Explore</button>
        {isGuest && <span className="pv-guest-tag">👁 Guest View</span>}
      </div>

      <div className="pv-card">
        <div className="pv-avatar" style={{ borderColor: theme.accent }}>
          {profile.photo
            ? <img src={profile.photo} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : (profile.avatar || '🌟')}
        </div>
        <div className="pv-name">@{profile.username}</div>
        {profile.bio && <div className="pv-bio">{profile.bio}</div>}

        <div className="pv-links">
          {profile.links.length === 0 && <p className="pv-empty">This creator hasn't added any links yet.</p>}
          {profile.links.map(link => (
            <button key={link.id} className="pv-link" onClick={() => handleClick(link)}
              style={{ '--link-accent': theme.accent }}>
              <span className="pv-link-icon">{link.icon}</span>
              <span className="pv-link-title">{link.title}</span>
              <span className="pv-link-arrow">↗</span>
            </button>
          ))}
        </div>

        {isGuest && (
          <div className="pv-guest-note">
            Want your own Linx page? <a href="/">Sign up free →</a>
          </div>
        )}
      </div>
    </div>
  );
}
