import AppNav from '../components/AppNav';
import './ComingSoon.css';

export default function ComingSoonPage({ user, onLogout, setUser, currentPage, onNavigate }) {
  return (
    <div className="cs-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="cs-main">
        <div className="cs-card">
          <div className="cs-lock">🔒</div>
          <div className="cs-tag">✦ Coming Soon</div>
          <h1 className="cs-title">AI for Linx</h1>
          <p className="cs-desc">
            We're building something powerful — AI-powered link suggestions, bio generation,
            smart analytics, and more. Stay tuned.
          </p>
          <div className="cs-features">
            {[
              { icon: '🤖', label: 'AI Bio Generator' },
              { icon: '🔗', label: 'Smart Link Suggestions' },
              { icon: '📊', label: 'AI Analytics Insights' },
              { icon: '🎨', label: 'Auto Theme Picker' },
            ].map((f, i) => (
              <div className="cs-feature" key={i}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
          <div className="cs-badge">🔒 Locked — Coming Soon</div>
        </div>
      </main>
    </div>
  );
}
