import { useState, useEffect } from 'react';
import AuthModal from '../components/AuthModal';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { getFounderPhotos, saveFounderPhoto } from '../store';
import './Landing.css';

const FEATURES = [
  {
    icon: '🔗', title: 'Unlimited Links', id: 'feature-links',
    desc: 'Add as many links as you want — no limits.',
    detail: 'Add links to your portfolio, social profiles, YouTube, Spotify, online store — anything. Reorder them instantly. Toggle any link on or off without deleting it. Every link gets its own click counter so you always know what\'s working.',
    action: 'signup', actionLabel: 'Start adding links →',
  },
  {
    icon: '📊', title: 'Click Tracking', id: 'feature-tracking',
    desc: 'See exactly how many times each link was clicked.',
    detail: 'Every click on every link is tracked in real time and stored in your dashboard. See your total visits, total clicks, and per-link click counts. Know exactly which content your audience engages with most.',
    action: 'signup', actionLabel: 'Track my links →',
  },
  {
    icon: '👥', title: 'Guest Browsing', id: 'feature-guest',
    desc: 'Anyone can browse and click creator links without signing up.',
    detail: 'No account needed to discover creators. Guests can browse all influencer pages, view their links, and click through to any destination. Perfect for sharing your Linx page with anyone — they just click and go.',
    action: 'browse', actionLabel: 'Browse creators →',
  },
  {
    icon: '⚡', title: 'Instant Setup', id: 'feature-setup',
    desc: 'Sign up and go live in under 60 seconds.',
    detail: 'Create your account, add your links, and share your page — all in under a minute. No design skills needed. No complicated settings. Just sign up, add your links, and you\'re live.',
    action: 'signup', actionLabel: 'Get started free →',
  },
];

export default function Landing({ onAuth, onBrowse, onLeaderboard, onDemo, user }) {
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [zoomedFounder, setZoomedFounder] = useState(null);
  const [founderPhotos, setFounderPhotos] = useState({});

  useEffect(() => {
    getFounderPhotos().then(setFounderPhotos);
  }, []);

  async function handlePhotoUpload(name, file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async e => {
      const updated = await saveFounderPhoto(name, e.target.result);
      setFounderPhotos(updated);
      setZoomedFounder(prev => prev?.name === name ? { ...prev, photo: e.target.result } : prev);
    };
    reader.readAsDataURL(file);
  }

  const FOUNDERS = [
    { name: 'Shreejeet Patnaik',     initials: 'SP', gradient: 'linear-gradient(135deg,#7B5CF6,#a78bfa)', glow: 'rgba(123,92,246,0.6)' },
    { name: 'Surya Prakash Narayan', initials: 'SN', gradient: 'linear-gradient(135deg,#F97316,#fb923c)', glow: 'rgba(249,115,22,0.6)'  },
  ];

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function handleFeatureClick(f) {
    setActiveFeature(f);
    setTimeout(() => scrollTo(f.id), 50);
  }

  function handleFeatureAction(f) {
    setActiveFeature(null);
    if (f.action === 'browse') onBrowse();
    else setModal(f.action);
  }

  return (
    <div className="landing">
      <nav className="l-nav">
        <span className="l-logo">Lin<span>x</span></span>
        <div className="l-nav-right">
          <ThemeSwitcher dropDown />
          <div className="l-nav-menu">
            <button className="btn btn-ghost l-nav-menu-trigger" onClick={() => setMenuOpen(o => !o)}>
              Menu {menuOpen ? '▴' : '▾'}
            </button>
            {menuOpen && (
              <div className="l-nav-dropdown">
                <button className="l-nav-drop-item" onClick={() => { setMenuOpen(false); onBrowse(); }}>👥 Browse Creators</button>
                <button className="l-nav-drop-item" onClick={() => { setMenuOpen(false); setModal('login'); }}>👤 Your Profile</button>
                <button className="l-nav-drop-item l-nav-drop-primary" onClick={() => { setMenuOpen(false); setModal('signup'); }}>🚀 Get Started →</button>
              </div>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => setModal('login')}>Log in</button>
        </div>
      </nav>

      <section className="l-hero">
        <div className="l-hero-text">
          <div className="tag tag-accent">✦ Free forever</div>
          <h1>One link.<br />Every <span className="l-highlight">destination.</span></h1>
          <p>Share all your links — portfolio, socials, shop — from one beautiful page. Built for creators, freelancers, and brands.</p>
          <div className="l-hero-btns">
            <button className="btn btn-primary" onClick={() => setModal('signup')}><span>Create your Linx →</span></button>
            <button className="btn-demo" onClick={onDemo}><span>📖 See how it works</span></button>
          </div>
        </div>

        <div className="l-hero-visual">
          <div className="l-blob l-blob1" />
          <div className="l-blob l-blob2" />
          <div className="l-phone">
            <div className="l-phone-inner">
              <div className="l-notch" />
              <div className="l-avatar">🌟</div>
              <div className="l-pname">@Linx</div>
              <div className="l-pbio">Designer & creator ✦</div>
              {[
                { bg: '#EDE9FE', icon: '🚀', label: 'Get Started' },
                { bg: '#FEF3C7', icon: '👥', label: 'Browse as Guest' },
                { bg: '#F0FDF4', icon: '👨‍💻', label: 'Meet the Founders' },
                { bg: '#DCFCE7', icon: '🏆', label: 'Leaderboard' },
              ].map(({ bg, icon, label }) => (
                <div className="l-plink" key={label}
                  onClick={
                    label === 'Get Started' ? () => setModal('signup') :
                    label === 'Browse as Guest' ? onBrowse :
                    label === 'Meet the Founders' ? () => document.querySelector('.l-founders')?.scrollIntoView({ behavior: 'smooth' }) :
                    label === 'Leaderboard' ? onLeaderboard :
                    undefined
                  }
                  style={{ cursor: label === 'Leaderboard' ? 'pointer' : label === 'Shop My Merch' ? 'default' : 'pointer' }}>
                  <span className="l-plink-icon" style={{ background: bg }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="l-features" id="features">
        {FEATURES.map(f => (
          <div
            className={`l-feat-card${activeFeature?.id === f.id ? ' active' : ''}`}
            key={f.title}
            id={f.id}
            onClick={() => handleFeatureClick(f)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleFeatureClick(f)}
          >
            <div className="l-feat-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="l-feat-arrow">{activeFeature?.id === f.id ? '▲' : '→'}</div>
          </div>
        ))}
      </section>

      {/* FEATURE DETAIL DRAWER */}
      {activeFeature && (
        <div className="l-feat-drawer" id={`drawer-${activeFeature.id}`}>
          <div className="l-feat-drawer-inner">
            <div className="l-feat-drawer-left">
              <div className="l-feat-drawer-icon">{activeFeature.icon}</div>
              <h2>{activeFeature.title}</h2>
              <p>{activeFeature.detail}</p>
              <div className="l-feat-drawer-btns">
                <button className="btn btn-primary" onClick={() => handleFeatureAction(activeFeature)}>
                  {activeFeature.actionLabel}
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveFeature(null)}>Close</button>
              </div>
            </div>
            <div className="l-feat-drawer-visual">
              <div className="l-feat-drawer-blob" />
              <div className="l-feat-drawer-card">
                <div className="l-feat-drawer-card-icon">{activeFeature.icon}</div>
                <div className="l-feat-drawer-card-title">{activeFeature.title}</div>
                <div className="l-feat-drawer-card-desc">{activeFeature.desc}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="l-cta">
        <h2>Ready to build your Linx?</h2>
        <p>Join creators who share smarter.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setModal('signup')}>Start for free →</button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 99 }} onClick={onBrowse}>Browse creators</button>
        </div>
      </div>

      {/* FOUNDERS SECTION */}
      <div className="l-founders">
        <div className="l-founders-inner">
          <div className="l-founders-label">✦ Built by</div>
          <h2 className="l-founders-title">The Founders</h2>
          <div className="l-founders-grid">
            {FOUNDERS.map((f, i) => (
              <div
                className="l-founder-card"
                key={f.name}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => setZoomedFounder({ ...f, photo: founderPhotos[f.name] || null })}
              >
                {/* avatar / photo */}
                <div className="l-founder-avatar-wrap">
                  {founderPhotos[f.name] ? (
                    <img src={founderPhotos[f.name]} alt={f.name} className="l-founder-photo" />
                  ) : (
                    <div className="l-founder-avatar" style={{ background: f.gradient }}>
                      {f.initials}
                      <div className="l-founder-avatar-glow" style={{ background: f.gradient }} />
                    </div>
                  )}
                  {/* upload button — admin only */}
                  {isAdmin && (
                  <label
                    className="l-founder-upload-btn"
                    title="Upload photo"
                    onClick={e => e.stopPropagation()}
                  >
                    📷
                    <input
                      type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handlePhotoUpload(f.name, e.target.files[0])}
                    />
                  </label>
                  )}
                </div>

                <div className="l-founder-name">{f.name}</div>
                <div className="l-founder-hint">Click to view</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="l-footer">
        <span className="l-logo">Lin<span>x</span></span>
        <p>© 2026 Linx. Made with ♥ by the founders.</p>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onToggle={setModal} onAuth={onAuth} />}

      {/* FOUNDER ZOOM LIGHTBOX */}
      {zoomedFounder && (
        <div className="founder-zoom-backdrop" onClick={() => setZoomedFounder(null)}>
          <div className="founder-zoom-box" onClick={e => e.stopPropagation()}>
            <button className="founder-zoom-close" onClick={() => setZoomedFounder(null)}>×</button>

            <div className="founder-zoom-ring" style={{ '--glow': zoomedFounder.glow }}>
              <div className="founder-zoom-ring-inner" style={{ background: zoomedFounder.gradient }}>
                {zoomedFounder.photo
                  ? <img src={zoomedFounder.photo} alt={zoomedFounder.name} className="founder-zoom-img" />
                  : <span className="founder-zoom-initials">{zoomedFounder.initials}</span>
                }
              </div>
            </div>

            {[...Array(8)].map((_, i) => (
              <div key={i} className="founder-zoom-particle" style={{
                '--angle': `${i * 45}deg`,
                '--delay': `${i * 0.12}s`,
                background: zoomedFounder.gradient,
              }} />
            ))}

            <div className="founder-zoom-name">{zoomedFounder.name}</div>
            <div className="founder-zoom-role">Co-Founder, Linx</div>

            {/* upload inside lightbox — admin only */}
            {isAdmin && (
            <label className="founder-zoom-upload" onClick={e => e.stopPropagation()}>
              {zoomedFounder.photo ? '🔄 Change Photo' : '📷 Add Photo'}
              <input
                type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handlePhotoUpload(zoomedFounder.name, e.target.files[0])}
              />
            </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
