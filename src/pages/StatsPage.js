import { useState, useEffect } from 'react';
import { getLinks, getNotifications } from '../store';
import AppNav from '../components/AppNav';
import './Dashboard.css';

export default function StatsPage({ user, onLogout, setUser, currentPage, onNavigate }) {
  const [links, setLinks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getLinks(user.id).then(setLinks);
    getNotifications().then(setNotifications);
  }, [user.id]);

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const activeLinks = links.filter(l => l.active).length;

  // 7-day chart
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toDateString(), count: 0 };
  });
  notifications.filter(n => n.type === 'click').forEach(n => {
    const d = new Date(n.time).toDateString();
    const day = days.find(x => x.date === d);
    if (day) day.count++;
  });
  const max = Math.max(...days.map(d => d.count), 1);
  const chartTotal = days.reduce((s, d) => s + d.count, 0);

  // top links
  const topLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

  return (
    <div className="dash-layout">
      <AppNav user={user} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="dash-main">
        <div className="stats-header">
          <h1 className="stats-title">📊 Your Stats</h1>
          <p className="stats-sub">Track your performance at a glance</p>
        </div>

        {/* Stat Cards */}
        <div className="dash-stats" style={{ marginBottom: '2rem' }}>
          <div className="dash-stat-card"><div className="dash-stat-label">Total Links</div><div className="dash-stat-val">{links.length}</div></div>
          <div className="dash-stat-card"><div className="dash-stat-label">Total Clicks</div><div className="dash-stat-val">{totalClicks}</div></div>
          <div className="dash-stat-card"><div className="dash-stat-label">Active Links</div><div className="dash-stat-val">{activeLinks}</div></div>
          <div className="dash-stat-card"><div className="dash-stat-label">👁 Profile Views</div><div className="dash-stat-val">{(user.profileViews || 0).toLocaleString()}</div></div>
        </div>

        {/* 7-Day Chart */}
        <div className="click-chart" style={{ marginBottom: '2rem' }}>
          <div className="click-chart-header">
            <div className="click-chart-title">📈 Clicks — Last 7 Days</div>
            <div className="click-chart-total">{chartTotal} total</div>
          </div>
          {chartTotal === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>No clicks in the last 7 days yet.</p>
            : (
              <div className="click-chart-bars">
                {days.map((d, i) => (
                  <div className="click-chart-col" key={i}>
                    <div className="click-chart-count">{d.count > 0 ? d.count : ''}</div>
                    <div className="click-chart-bar-wrap">
                      <div className="click-chart-bar" style={{ height: `${(d.count / max) * 100}%`, animationDelay: `${i * 0.07}s` }} />
                    </div>
                    <div className="click-chart-label">{d.label}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Top Links */}
        {topLinks.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1rem' }}>🔥 Top Links by Clicks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {topLinks.map((link, i) => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 1rem', background: 'var(--paper)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--accent)', width: '20px' }}>#{i + 1}</span>
                  <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</span>
                  <span style={{ fontSize: '0.78rem', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0.2rem 0.7rem', borderRadius: '99px', fontWeight: 700 }}>{link.clicks || 0} clicks</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
