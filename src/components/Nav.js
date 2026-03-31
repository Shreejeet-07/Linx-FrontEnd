import './Nav.css';

export default function Nav({ onGetStarted }) {
  return (
    <nav className="nav">
      <a href="#" className="logo">Lin<span>x</span></a>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <button className="btn-nav" onClick={onGetStarted}>Get Started</button>
      </div>
    </nav>
  );
}
