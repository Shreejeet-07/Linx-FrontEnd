import './Pricing.css';

export default function Pricing({ onSignup }) {
  return (
    <section className="section" id="pricing">
      <div className="section-tag">Pricing</div>
      <h2 className="section-title">Simple, honest pricing.</h2>
      <p className="section-sub">Start free. Upgrade when you're ready.</p>
      <div className="pricing-grid">
        <div className="price-card featured">
          <div className="price-badge">SALE</div>
          <div className="price-name">Pro</div>
          <div className="price-amount">₹0</div>
          <div className="price-period">per month</div>
          <ul className="price-features">
            {['Unlimited links', 'All themes + custom themes', 'Advanced analytics & charts', 'Custom domain support', 'Priority support', 'QR code generation'].map(f => <li key={f}>{f}</li>)}
          </ul>
          <button className="btn-price inv" onClick={onSignup}>Start Pro →</button>
        </div>
        <div className="price-card">
          <div className="price-name">Team</div>
          <div className="price-amount">₹299</div>
          <div className="price-period">per month · up to 2 users</div>
          <ul className="price-features">
            {['Everything in Pro', 'Team dashboard', 'Shared brand kit', 'Admin controls', 'Dedicated support', 'White-label option'].map(f => <li key={f}>{f}</li>)}
          </ul>
          <button className="btn-price dark">Contact sales</button>
        </div>
      </div>
    </section>
  );
}
