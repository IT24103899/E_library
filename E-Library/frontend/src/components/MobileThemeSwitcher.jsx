import React from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from './MobileThemeSwitcher.module.css';

const MobileThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { id: 'light', icon: <Sun size={20} />, label: 'Light' },
    { id: 'dark', icon: <Moon size={20} />, label: 'Dark' },
    { id: 'sepia', icon: <BookOpen size={20} />, label: 'Sepia' }
  ];

  return (
    <div className={styles.themeSwitcherWrapper}>
      <h4 className={styles.switcherLabel}>Application Theme</h4>
      <div className={styles.switcherGrid}>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => toggleTheme(t.id)}
            className={`${styles.themeOption} ${theme === t.id ? styles.active : ''}`}
          >
            <div className={`${styles.iconCircle} ${styles[t.id]}`}>
              {t.icon}
            </div>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileThemeSwitcher;
