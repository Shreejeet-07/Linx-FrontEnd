import { useState } from 'react';
import { updateProfile } from '../store';
import AppNav from '../components/AppNav';
import './ProfilePage.css';

export const PROFILE_THEMES = [
  { id: 'default',  label: 'Cosmic',   bg: 'linear-gradient(145deg,#0f0c29,#302b63,#24243e)', accent: '#7B5CF6' },
  { id: 'sunset',   label: 'Sunset',   bg: 'linear-gradient(145deg,#1a0533,#6b1a3a,#c0392b)', accent: '#F97316' },
  { id: 'ocean',    label: 'Ocean',    bg: 'linear-gradient(145deg,#0a1628,#0d3b6e,#1a6b8a)', accent: '#06B6D4' },
  { id: 'forest',   label: 'Forest',   bg: 'linear-gradient(145deg,#071209,#0d3318,#1a5c2a)', accent: '#22C55E' },
  { id: 'rose',     label: 'Rose',     bg: 'linear-gradient(145deg,#1a0a14,#4a1030,#8b1a4a)', accent: '#EC4899' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(145deg,#050508,#0d0d1a,#1a1a35)', accent: '#00FFC8' },
  { id: 'amber',    label: 'Amber',    bg: 'linear-gradient(145deg,#1a0f00,#4a2800,#8b5000)', accent: '#F59E0B' },
  { id: 'slate',    label: 'Slate',    bg: 'linear-gradient(145deg,#0f1117,#1e2130,#2d3250)', accent: '#818CF8' },
];

export default function ProfilePage({ user, onLogout, setUser, currentPage, onNavigate }) {
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '🌟');
  const [photo, setPhoto] = useState(user.photo || null);
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [profileTheme, setProfileTheme] = useState(user.profileTheme || 'default');
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [copiedPage, setCopiedPage] = useState(false);

  const myPageUrl = `${window.location.origin}/?user=${user.id}`;
  const currentTheme = PROFILE_THEMES.find(t => t.id === profileTheme) || PROFILE_THEMES[0];

  function handlePhotoFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  }

  function handlePhotoDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handlePhotoFile(e.dataTransfer.files[0]);
  }

  async function handleSave(e) {
    e.preventDefault();
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    const profileRes = await updateProfile(user.id, { bio, avatar, photo });
    if (profileRes) {
      setUser({ ...user, bio: profileRes.bio, avatar: profileRes.avatar, photo: profileRes.photo || photo, username, email, profileTheme });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function copyPageLink() {
    navigator.clipboard.writeText(myPageUrl);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  }

  return (
    <div className="pp-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="pp-main">
        <div className="pp-grid">

          {/* LEFT — Live Preview */}
          <div className="pp-preview-col">
            <div className="pp-preview-card" style={{ background: currentTheme.bg }}>
              <div className="pp-preview-bg">
                <div className="pp-bg-blob1" style={{ background: `radial-gradient(circle,${currentTheme.accent}99,transparent 70%)` }} />
                <div className="pp-bg-blob2" />
                {['❤️','💬','🔗','📸','✨','🎵','🔥','💡','🌟','📱'].map((icon, i) => (
                  <span key={i} className="pp-bg-float-icon" style={{ '--i': i }}>{icon}</span>
                ))}
              </div>
              <div className="pp-preview-content">
                <div className="pp-preview-avatar-ring" style={{ background: `linear-gradient(135deg,${currentTheme.accent},${currentTheme.accent}88)` }}>
                  <div className="pp-preview-avatar">
                    {photo ? <img src={photo} alt="preview" /> : <span>{avatar || '🌟'}</span>}
                  </div>
                </div>
                <div className="pp-preview-name">@{username || user.username}</div>
                <div className="pp-preview-bio">{bio || 'Your bio appears here...'}</div>
                <div className="pp-preview-email">{email || user.email}</div>
                <div className="pp-preview-share">
                  <div className="pp-preview-share-url">{myPageUrl}</div>
                  <button className={`pp-copy-btn${copiedPage ? ' copied' : ''}`} onClick={copyPageLink}>
                    {copiedPage ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            </div>
            <div className="pp-preview-label">Live Preview</div>
          </div>

          {/* RIGHT — Edit Form */}
          <div className="pp-form-col">
            <div className="pp-form-card">
              <div className="pp-form-header">
                <h2>Edit Profile</h2>
                <p>Changes are saved to the database instantly</p>
              </div>

              <form onSubmit={handleSave} className="pp-form">

                {/* ACCOUNT */}
                <div className="pp-section">
                  <div className="pp-section-title"><span className="pp-section-icon">🔐</span> Account</div>
                  <div className="pp-field">
                    <label>Username</label>
                    <div className="pp-input-wrap">
                      <span className="pp-input-prefix">@</span>
                      <input value={username} onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: '' })); }} placeholder="yourname" className={errors.username ? 'error' : ''} />
                    </div>
                    {errors.username && <div className="pp-error">{errors.username}</div>}
                  </div>
                  <div className="pp-field">
                    <label>Email</label>
                    <div className="pp-input-wrap">
                      <span className="pp-input-prefix">✉️</span>
                      <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="you@example.com" className={errors.email ? 'error' : ''} />
                    </div>
                    {errors.email && <div className="pp-error">{errors.email}</div>}
                  </div>
                </div>

                {/* PROFILE THEME */}
                <div className="pp-section">
                  <div className="pp-section-title"><span className="pp-section-icon">🎨</span> Profile Theme</div>
                  <div className="pp-theme-grid">
                    {PROFILE_THEMES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        className={`pp-theme-swatch${profileTheme === t.id ? ' selected' : ''}`}
                        style={{ background: t.bg }}
                        onClick={() => setProfileTheme(t.id)}
                        title={t.label}
                      >
                        <span className="pp-theme-dot" style={{ background: t.accent }} />
                        <span className="pp-theme-name">{t.label}</span>
                        {profileTheme === t.id && <span className="pp-theme-check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* APPEARANCE */}
                <div className="pp-section">
                  <div className="pp-section-title"><span className="pp-section-icon">✨</span> Appearance</div>
                  <div className="pp-field">
                    <label>Profile Photo</label>
                    <div
                      className={`pp-photo-zone${dragOver ? ' drag-over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handlePhotoDrop}
                      onClick={() => document.getElementById('ppPhotoInput').click()}
                    >
                      {photo ? (
                        <div className="pp-photo-preview">
                          <img src={photo} alt="profile" />
                          <button type="button" className="pp-photo-remove" onClick={e => { e.stopPropagation(); setPhoto(null); }}>×</button>
                        </div>
                      ) : (
                        <div className="pp-photo-placeholder">
                          <div className="pp-photo-icon">📸</div>
                          <div className="pp-photo-text">Click or drag & drop</div>
                          <div className="pp-photo-hint">JPG, PNG, GIF — max 5MB</div>
                        </div>
                      )}
                    </div>
                    <input id="ppPhotoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoFile(e.target.files[0])} />
                  </div>
                  <div className="pp-field pp-field-row">
                    <div style={{ flex: 1 }}>
                      <label>Avatar Emoji <span className="pp-label-hint">(fallback)</span></label>
                      <input value={avatar} onChange={e => setAvatar(e.target.value)} maxLength={2} placeholder="🌟" className="pp-emoji-input" />
                    </div>
                  </div>
                  <div className="pp-field">
                    <label>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about yourself..." rows={3} />
                  </div>
                </div>

                <button type="submit" className={`btn btn-primary pp-save-btn${saved ? ' saved' : ''}`}>
                  {saved ? '✅ Saved!' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
