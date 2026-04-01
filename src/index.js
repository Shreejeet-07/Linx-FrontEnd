import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ThemeProvider } from './components/ThemeContext';

// Unregister any old service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
