import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'light', label: 'Light',  icon: '☀️',  desc: 'Clean & bright'     },
  { id: 'dark',  label: 'Dark',   icon: '🌙',  desc: 'Easy on the eyes'   },
  { id: 'eco',   label: 'Eco',    icon: '🌿',  desc: 'Nature-inspired'    },
  { id: 'neon',  label: 'Neon',   icon: '⚡',  desc: 'Cyberpunk vibes'    },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('linx_theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('linx_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
