import { useState } from 'react';
import { generateBio, generateLinkTitle, roastProfile, getLinks } from '../store';
import AppNav from '../components/AppNav';
import './ComingSoon.css';

export default function ComingSoonPage({ user, onLogout, setUser, currentPage, onNavigate }) {
  const [bioLoading, setBioLoading] = useState(false);
  const [bioResult, setBioResult] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkResult, setLinkResult] = useState(null);
  const [roastLoading, setRoastLoading] = useState(false);
  const [roastResult, setRoastResult] = useState('');
  const [copied, setCopied] = useState('');

  async function handleGenerateBio() {
    setBioLoading(true); setBioResult('');
    const links = await getLinks();
    const result = await generateBio(user.username, links);
    setBioLoading(false);
    if (result?.bio) setBioResult(result.bio);
  }

  async function handleGenerateLinkTitle() {
    if (!linkUrl.trim()) return;
    setLinkLoading(true); setLinkResult(null);
    const result = await generateLinkTitle(linkUrl);
    setLinkLoading(false);
    if (result) setLinkResult(result);
  }

  async function handleRoast() {
    setRoastLoading(true); setRoastResult('');
    const links = await getLinks();
    const result = await roastProfile(user.username, user.bio, links);
    setRoastLoading(false);
    if (result?.roast) setRoastResult(result.roast);
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="cs-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="cs-main" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 700 }}>

          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-icon">✨</div>
            <div>
              <h1 className="ai-title">AI for Linx</h1>
              <p className="ai-sub">Powered by Google Gemini — your personal AI assistant</p>
            </div>
          </div>

          {/* Bio Generator */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-card-icon">🤖</span>
              <div>
                <div className="ai-card-title">AI Bio Generator</div>
                <div className="ai-card-desc">Generate a catchy bio based on your username and links</div>
              </div>
            </div>
            <button className="btn btn-primary ai-btn" onClick={handleGenerateBio} disabled={bioLoading}>
              {bioLoading ? '✨ Generating…' : '✨ Generate My Bio'}
            </button>
            {bioResult && (
              <div className="ai-result">
                <div className="ai-result-text">"{bioResult}"</div>
                <div className="ai-result-actions">
                  <button className="ai-copy-btn" onClick={() => copyText(bioResult, 'bio')}>
                    {copied === 'bio' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button className="ai-use-btn" onClick={() => { onNavigate('profile'); }}>
                    Use this bio →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Link Title Suggester */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-card-icon">🔗</span>
              <div>
                <div className="ai-card-title">AI Link Title Suggester</div>
                <div className="ai-card-desc">Paste any URL and AI will suggest a title and emoji</div>
              </div>
            </div>
            <div className="ai-input-row">
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateLinkTitle()}
              />
              <button className="btn btn-primary ai-btn" onClick={handleGenerateLinkTitle} disabled={linkLoading || !linkUrl.trim()}>
                {linkLoading ? '…' : 'Suggest'}
              </button>
            </div>
            {linkResult && (
              <div className="ai-result">
                <div className="ai-result-text" style={{ fontSize: '1.2rem' }}>
                  {linkResult.icon} {linkResult.title}
                </div>
                <div className="ai-result-actions">
                  <button className="ai-copy-btn" onClick={() => copyText(`${linkResult.icon} ${linkResult.title}`, 'link')}>
                    {copied === 'link' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Roast */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-card-icon">🔥</span>
              <div>
                <div className="ai-card-title">Roast My Profile</div>
                <div className="ai-card-desc">Get a funny AI roast of your Linx profile</div>
              </div>
            </div>
            <button className="btn ai-roast-btn" onClick={handleRoast} disabled={roastLoading}>
              {roastLoading ? '🔥 Roasting…' : '🔥 Roast Me!'}
            </button>
            {roastResult && (
              <div className="ai-result ai-roast-result">
                <div className="ai-result-text">"{roastResult}"</div>
                <button className="ai-copy-btn" onClick={() => copyText(roastResult, 'roast')}>
                  {copied === 'roast' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
