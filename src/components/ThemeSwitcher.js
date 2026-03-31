import { useState, useRef, useEffect } from 'react';
import { THEMES, useTheme } from './ThemeContext';
import './ThemeSwitcher.css';

export default function ThemeSwitcher({ dropDown = false }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = THEMES.find(t => t.id === theme);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="ts-wrap" ref={ref}>
      {/* Popup — renders ABOVE the trigger, inside the sidebar */}
      {open && (
        <div className={`ts-popover${dropDown ? ' ts-popover-down' : ''}`}>
          <div className="ts-popover-title">Choose Theme</div>
          <div className="ts-grid">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`ts-option theme-preview-${t.id}${theme === t.id ? ' selected' : ''}`}
                onClick={() => { setTheme(t.id); setOpen(false); }}
              >
                <span className="ts-opt-icon">{t.icon}</span>
                <span className="ts-opt-label">{t.label}</span>
                <span className="ts-opt-desc">{t.desc}</span>
                {theme === t.id && <span className="ts-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className={`ts-trigger theme-${theme}`}
        onClick={() => setOpen(o => !o)}
        title="Switch theme"
      >
        <span className="ts-icon">{current.icon}</span>
        <span className="ts-label">{current.label}</span>
        <span className={`ts-chevron${open ? ' open' : ''}`}>▾</span>
      </button>
    </div>
  );
}
