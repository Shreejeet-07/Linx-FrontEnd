import './DemoPage.css';

const STEPS = [
  {
    step: '01', icon: '🔐', title: 'Sign Up with Google',
    desc: 'Click "Create your Linx" on the home page. Hit "Sign up with Google", choose your Gmail account. Google verifies your email — no fake accounts allowed.',
    action: 'signup', actionLabel: 'Sign up now →',
  },
  {
    step: '02', icon: '✏️', title: 'Set Your Username & Password',
    desc: 'After Google verifies you, pick a unique username like "yourname" — your public page will be at linxs.co.in/?user=yourID. Set a password for future logins.',
    action: 'signup', actionLabel: 'Get started →',
  },
  {
    step: '03', icon: '🔗', title: 'Add Your Links',
    desc: 'In your dashboard, click "Add New Link". Give it a title, paste the URL, and pick an emoji icon. Add as many links as you want — portfolio, Instagram, YouTube, shop, anything.',
  },
  {
    step: '04', icon: '🌍', title: 'Share Your Page',
    desc: 'Copy your public page link from the dashboard banner. Share it on Instagram bio, Twitter, WhatsApp — anywhere. Anyone can visit and click your links without signing up.',
  },
  {
    step: '05', icon: '📊', title: 'Track Your Clicks',
    desc: 'Every click on every link is tracked in real time. See total clicks, per-link counts, and get notified every time someone clicks your link.',
  },
  {
    step: '06', icon: '🔔', title: 'Get Notified',
    desc: 'You get a notification every time someone clicks your link or leaves you a review. Check your Notifications tab to stay updated.',
  },
];

const FEATURES = [
  { icon: '🔗', title: 'Unlimited Links', desc: 'Add, edit, reorder, toggle links on/off anytime.' },
  { icon: '📊', title: 'Click Analytics', desc: 'Real-time click tracking per link.' },
  { icon: '🎨', title: '8 Profile Themes', desc: 'Cosmic, Sunset, Ocean, Forest, Rose, Midnight, Amber, Slate.' },
  { icon: '📸', title: 'Profile Photo', desc: 'Upload a photo or use an emoji avatar.' },
  { icon: '💬', title: 'Reviews', desc: 'Visitors can leave star ratings and reviews on your profile.' },
  { icon: '🔔', title: 'Notifications', desc: 'Get notified on clicks, reviews and admin announcements.' },
  { icon: '🌍', title: 'Browse Creators', desc: 'Explore all creators on the platform.' },
  { icon: '🏆', title: 'Leaderboard', desc: 'See top creators ranked by clicks.' },
  { icon: '🔐', title: 'Google Auth Only', desc: 'Only verified Gmail accounts can register — no fake emails.' },
];

export default function DemoPage({ onBack, onSignup }) {
  return (
    <div className="demo-layout">
      <nav className="demo-nav">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <span className="demo-logo">Lin<span>x</span></span>
        <button className="btn btn-primary" onClick={onSignup}>Get Started →</button>
      </nav>

      {/* HERO */}
      <div className="demo-hero">
        <div className="demo-hero-tag">📖 How it works</div>
        <h1>Everything you need to know<br />about <span>Linx</span></h1>
        <p>Your complete guide to setting up, using, and getting the most out of your Linx page.</p>
        <button className="btn btn-primary demo-hero-cta" onClick={onSignup}>Create your Linx for free →</button>
      </div>

      {/* STEPS */}
      <div className="demo-section">
        <div className="demo-section-label">🚀 Getting Started</div>
        <h2 className="demo-section-title">Step by Step Guide</h2>
        <div className="demo-steps">
          {STEPS.map((s, i) => (
            <div
              className={`demo-step${s.action ? ' demo-step-clickable' : ''}`}
              key={i}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={s.action ? onSignup : undefined}
            >
              <div className="demo-step-num">{s.step}</div>
              <div className="demo-step-icon">{s.icon}</div>
              <div className="demo-step-content">
                <div className="demo-step-title">
                  {s.title}
                  {s.action && <span className="demo-step-badge">Click to start</span>}
                </div>
                <div className="demo-step-desc">{s.desc}</div>
                {s.action && (
                  <button className="demo-step-action" onClick={e => { e.stopPropagation(); onSignup(); }}>
                    {s.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="demo-section demo-section-dark">
        <div className="demo-section-label" style={{ color: 'rgba(255,255,255,0.5)' }}>✨ What's included</div>
        <h2 className="demo-section-title" style={{ color: '#fff' }}>All Features</h2>
        <div className="demo-features-grid">
          {FEATURES.map((f, i) => (
            <div className="demo-feature-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="demo-feature-icon">{f.icon}</div>
              <div className="demo-feature-title">{f.title}</div>
              <div className="demo-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LOGIN GUIDE */}
      <div className="demo-section">
        <div className="demo-section-label">🔑 Signing In</div>
        <h2 className="demo-section-title">How to Log In</h2>
        <div className="demo-login-cards">
          <div className="demo-login-card">
            <div className="demo-login-icon">🔐</div>
            <div className="demo-login-title">Continue with Google</div>
            <div className="demo-login-desc">Click "Sign in with Google" on the login page. Select your Gmail account. You'll be logged in instantly — no password needed.</div>
          </div>
          <div className="demo-login-card">
            <div className="demo-login-icon">📧</div>
            <div className="demo-login-title">Email / Username + Password</div>
            <div className="demo-login-desc">Enter your registered Gmail address or your username, along with the password you set during signup. Click "Log in".</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="demo-cta">
        <h2>Ready to get started?</h2>
        <p>Create your free Linx page in under 60 seconds.</p>
        <button className="btn btn-primary" onClick={onSignup}>Create your Linx →</button>
      </div>

      <footer className="demo-footer">
        <span className="demo-logo">Lin<span>x</span></span>
        <p>© 2026 Linx. Made with ♥ by the founders.</p>
      </footer>
    </div>
  );
}
