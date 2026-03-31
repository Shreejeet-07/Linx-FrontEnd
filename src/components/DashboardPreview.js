import './DashboardPreview.css';

export default function DashboardPreview() {
  return (
    <div className="dash-bg">
      <section className="section">
        <div className="section-tag">Dashboard</div>
        <h2 className="section-title">Your command center.</h2>
        <p className="section-sub">Manage links, customize your profile, and track your performance — all from one clean dashboard.</p>
        <div className="dashboard-preview">
          <div className="dash-topbar">
            <div className="dash-dot" style={{ background: '#FF5F57' }} />
            <div className="dash-dot" style={{ background: '#FEBC2E' }} />
            <div className="dash-dot" style={{ background: '#28C840' }} />
            <div className="dash-url">linx.app/dashboard</div>
          </div>
          <div className="dash-body">
            <div className="dash-sidebar">
              <div className="dash-logo">Linx</div>
              {['🔗 My Links', '👤 Profile', '🎨 Appearance', '📊 Analytics', '⚙️ Settings'].map((item, i) => (
                <div className={`dash-nav-item${i === 0 ? ' active' : ''}`} key={item}>{item}</div>
              ))}
            </div>
            <div className="dash-main">
              <h4>Overview</h4>
              <div className="stat-cards">
                {[['Total Visits', '2,841', '↑ +12% this week'], ['Link Clicks', '1,204', '↑ +8% this week'], ['Click Rate', '42%', '↑ +3% this week']].map(([label, val, diff]) => (
                  <div className="stat-card" key={label}>
                    <div className="s-label">{label}</div>
                    <div className="s-val">{val}</div>
                    <div className="s-diff">{diff}</div>
                  </div>
                ))}
              </div>
              <div className="dash-links-header">
                <h4>My Links</h4>
                <button className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}>+ Add Link</button>
              </div>
              <div className="link-rows">
                {[
                  { title: '🎨 My Portfolio', url: 'alex.design', clicks: '843 clicks', on: true },
                  { title: '💜 Instagram', url: 'instagram.com/alex.creates', clicks: '241 clicks', on: true },
                  { title: '🛒 Merch Store', url: 'shop.alex.design', clicks: '120 clicks', on: false },
                ].map(row => (
                  <div className="link-row" key={row.title}>
                    <span className="drag">⠿</span>
                    <div>
                      <div className="l-title">{row.title}</div>
                      <div className="l-url">{row.url}</div>
                    </div>
                    <div className="l-clicks">{row.clicks}</div>
                    <div className={`toggle${row.on ? '' : ' off'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
