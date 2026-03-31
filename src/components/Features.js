import './Features.css';

const features = [
  { icon: '🎨', title: 'Beautiful Themes', desc: 'Choose from curated themes or build your own with custom colors, fonts, and button styles.' },
  { icon: '📊', title: 'Link Analytics', desc: 'Track clicks per link and total profile visits. See which content resonates most.' },
  { icon: '↕️', title: 'Drag & Drop Reorder', desc: 'Prioritize your most important links by simply dragging them to the top.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'BCrypt-hashed passwords, JWT authentication, and HTTPS enforced on all routes.' },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="section-tag">Features</div>
      <h2 className="section-title">Everything you need,<br />nothing you don't.</h2>
      <div className="features-grid">
        {features.map(f => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-text">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
        <div className="feature-card accent-card">
          <div className="feature-icon">📱</div>
          <div className="feature-text">
            <h3>Looks perfect on every device.</h3>
            <p>Your Linx page is fully responsive — flawless on mobile, tablet, and desktop.</p>
          </div>
          <div style={{ fontSize: '4rem', opacity: 0.3, flexShrink: 0 }}>📱</div>
        </div>
      </div>
    </section>
  );
}
