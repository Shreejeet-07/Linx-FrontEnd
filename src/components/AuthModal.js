import { useState, useEffect } from 'react';
import { signup, login } from '../store';
import './AuthModal.css';

export default function AuthModal({ mode, onClose, onToggle, onAuth }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError(''); setUsername(''); setEmail(''); setPassword('');
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !username.trim()) { setError('Username is required.'); return; }
    if (!email.trim() || !password.trim()) { setError('All fields are required.'); return; }

    const result = mode === 'signup'
      ? await signup({ username, email, password })
      : await login({ email, password });

    if (result.error) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <h2>{mode === 'signup' ? 'Create Account' : 'Welcome back'}</h2>
        <p className="modal-sub">
          {mode === 'signup' ? 'Start your Linx for free — no credit card needed.' : 'Log in to your Linx dashboard.'}
        </p>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Username</label>
              <div className="username-row">
                <span>linx.app/</span>
                <input type="text" placeholder="yourname" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--muted)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="btn btn-primary modal-submit">
            {mode === 'signup' ? 'Create my Linx →' : 'Log in →'}
          </button>
        </form>
        <p className="modal-toggle">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => onToggle(mode === 'signup' ? 'login' : 'signup')}>
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
