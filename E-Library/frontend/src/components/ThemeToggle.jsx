import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme-mode';

const ThemeToggle = ({ className = '' }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial = saved === 'dark' ? 'dark' : 'light';
      setMode(initial);
      applyMode(initial);
    } catch (e) {
      applyMode('light');
    }
  }, []);

  const applyMode = (m) => {
    const el = document.documentElement || document.body;
    if (!el) return;
    if (m === 'dark') {
      el.classList.add('dark');
    } else {
      el.classList.remove('dark');
    }
  };

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    applyMode(next);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={mode === 'dark'}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      className={"px-3 py-2 rounded-lg border bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-sm " + className}
    >
      {mode === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;
