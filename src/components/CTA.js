import { useState } from 'react';
import './CTA.css';

export default function CTA({ onSignup }) {
  const [username, setUsername] = useState('');

  function claim() {
    if (!username.trim()) return;
    onSignup();
  }

  return (
    <div className="cta-section">
      <div className="cta-bg-dot" style={{ width: 400, height: 400, top: -100, left: -100 }} />
      <div className="cta-bg-dot" style={{ width: 300, height: 300, bottom: -80, right: -80, background: '#f97316' }} />
      <h2>Ready to build your Linx?</h2>
      <p>Join thousands of creators, freelancers, and brands.</p>
      <div className="cta-input-row">
        <span>linx.app/</span>
        <input type="text" placeholder="yourname" value={username} onChange={e => setUsername(e.target.value)} />
        <button className="btn-primary" style={{ whiteSpace: 'nowrap', borderRadius: 10, padding: '0.7rem 1.2rem', fontSize: '0.85rem' }} onClick={claim}>Claim it →</button>
      </div>
    </div>
  );
}
