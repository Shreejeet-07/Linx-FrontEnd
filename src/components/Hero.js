import './Hero.css';

export default function Hero({ onSignup }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="section-tag">✦ Free to start</div>
        <h1>One link.<br />Every<br /><span className="underline">destination.</span></h1>
        <p>Linx gives you a beautiful, customizable page to share all your important links — portfolio, social media, shop, and more — in one place.</p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={onSignup}>Create your Linx →</button>
          <button className="btn-secondary">See a demo</button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="phone-wrap">
          <div className="phone">
            <div className="phone-screen">
              <div className="phone-notch" />
              <div className="phone-avatar">🌟</div>
              <div className="phone-name">@alex.creates</div>
              <div className="phone-bio">Designer & creator ✦ DMs open</div>
              {[
                { bg: '#FEF3C7', icon: '🎨', label: 'My Portfolio' },
                { bg: '#EDE9FE', icon: '💜', label: 'Instagram' },
                { bg: '#FEE2E2', icon: '🎵', label: 'Latest Track' },
                { bg: '#DCFCE7', icon: '🛒', label: 'Shop My Merch' },
              ].map(({ bg, icon, label }) => (
                <div className="phone-link" key={label}>
                  <div className="icon" style={{ background: bg }}>{icon}</div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
