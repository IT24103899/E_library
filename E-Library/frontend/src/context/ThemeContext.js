import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'light';
  });

  // Apply theme class to <html> element for global CSS variables
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'sepia');
    root.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (['light', 'dark', 'sepia'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
