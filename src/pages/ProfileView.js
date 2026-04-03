import { useState, useEffect } from 'react';
import { getPublicProfile, guestTrackClick, getReviews, addReview } from '../store';
import { PROFILE_THEMES } from './ProfilePage';
import './ProfileView.css';

function StarRating({ value, onChange }) {
  return (
    <div className="pv-stars-input">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`pv-star-btn${s <= value ? ' active' : ''}`}>★</button>
      ))}
    </div>
  );
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMusicEmbed(url) {
  if (!url) return null;
  // Spotify track/playlist/album
  const spotifyMatch = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0&autoplay=1`;
  }
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&enablejsapi=1`;
  }
  return null;
}

export default function ProfileView({ userId, onBack, isGuest }) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [musicOpen, setMusicOpen] = useState(true);
  const isDirectLink = new URLSearchParams(window.location.search).get('user') === userId;

  useEffect(() => {
    getPublicProfile(userId).then(setProfile);
    getReviews(userId).then(setReviews);
  }, [userId]);

  async function handleClick(link) {
    await guestTrackClick(userId, link.id);
    window.open(link.url.startsWith('http') ? link.url : `https://${link.url}`, '_blank');
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !message.trim()) { setError('Name and message are required.'); return; }
    setSubmitting(true);
    const result = await addReview(userId, { name, message, rating });
    setSubmitting(false);
    if (result) {
      setReviews(result);
      setName(''); setMessage(''); setRating(5);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      setError('Failed to submit review. Try again.');
    }
  }

  if (!profile) return (
    <div className="pv-layout">
      {!isDirectLink && <button className="btn btn-ghost pv-back" onClick={onBack}>← Back</button>}
      <div className="pv-loading">Loading profile…</div>
    </div>
  );

  const theme = PROFILE_THEMES.find(t => t.id === profile.profileTheme) || PROFILE_THEMES[0];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="pv-layout" style={{ background: theme.bg }}>
      <div className="pv-bg-icons" aria-hidden="true">
        {['❤️','💬','🔗','📸','✨','🎵','🔥','💡','🌟','👾','📱','💎','🎯','🚀','💫'].map((icon, i) => (
          <span key={i} className="pv-bg-icon" style={{ '--i': i }}>{icon}</span>
        ))}
      </div>
      <div className="pv-topbar">
        {!isDirectLink && <button className="btn btn-ghost" onClick={onBack}>← Back to Explore</button>}
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
        <div className="pv-views">👁 {(profile.profileViews || 0).toLocaleString()} profile views</div>
        {avgRating && (
          <div className="pv-avg-rating">
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            <span>{avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        )}

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

        {/* ── Reviews ── */}
        <div className="pv-reviews-section">
          <div className="pv-reviews-title">💬 Reviews {reviews.length > 0 && `(${reviews.length})`}</div>

          {reviews.length === 0 && <p className="pv-reviews-empty">No reviews yet. Be the first!</p>}

          <div className="pv-reviews-list">
            {reviews.map((r, i) => (
              <div key={i} className="pv-review-card">
                <div className="pv-review-header">
                  <span className="pv-review-name">{r.name}</span>
                  <span className="pv-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="pv-review-time">{timeAgo(r.time)}</span>
                </div>
                <div className="pv-review-message">{r.message}</div>
              </div>
            ))}
          </div>

          {/* ── Review Form ── */}
          <form className="pv-review-form" onSubmit={handleReviewSubmit}>
            <div className="pv-review-form-title">Leave a Review</div>
            <input
              type="text" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)}
              className="pv-review-input"
            />
            <textarea
              placeholder="Write your review..." value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3} className="pv-review-input"
            />
            <StarRating value={rating} onChange={setRating} />
            {error && <p className="pv-review-error">{error}</p>}
            <button type="submit" className="pv-review-submit" disabled={submitting}>
              {submitting ? 'Submitting…' : submitted ? '✅ Submitted!' : 'Submit Review'}
            </button>
          </form>
        </div>

        {isGuest && (
          <div className="pv-guest-note">
            Want your own Linx page? <a href="/">Sign up free →</a>
          </div>
        )}
      </div>

      {/* ── Floating Music Player ── */}
      {profile.musicUrl && getMusicEmbed(profile.musicUrl) && (
        <div className={`pv-music-player${musicOpen ? ' open' : ''}`}>
          <button className="pv-music-toggle" onClick={() => setMusicOpen(o => !o)}
            style={{ background: theme.accent }}>
            {musicOpen ? '✕' : '🎵'}
          </button>
          {musicOpen && (
            <div className="pv-music-embed">
              <iframe
                src={getMusicEmbed(profile.musicUrl)}
                width="100%"
                height={profile.musicUrl.includes('spotify') ? '80' : '120'}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                title="Background Music"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
