import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Book, Bookmark, MessageSquare, 
  Settings, LogOut, Gem, User, Sun, Moon, BookText
} from 'lucide-react';
import styles from './Header.module.css';
import PaymentModal from './PaymentModal';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setUser(JSON.parse(raw));
    
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, [isPaymentModalOpen]);

  const handleUpgradeSuccess = () => {
    const raw = localStorage.getItem('authUser');
    if (raw) setUser(JSON.parse(raw));
    navigate('/payment/success');
  };

  const isActive = (path) => (location.pathname === path ? styles.navLinkActive : '');

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* LOGO SECTION */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoBadge}>
            <img src="/images/premium_logo.png" alt="" className={styles.logoImage} />
          </div>
          <div className={styles.logoText}>
            <h1 className={styles.logoTitle}>E-Library</h1>
            <p className={styles.logoSubtitle}>The Sanctuary</p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className={styles.navDesktop}>
          <Link to="/activity" className={`${styles.navLink} ${isActive('/activity')}`}>
            <LayoutDashboard className={styles.navIcon} size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/books" className={`${styles.navLink} ${isActive('/books')}`}>
            <Book className={styles.navIcon} size={18} />
            <span>Books</span>
          </Link>
          {user && (
            <Link to="/bookshelf" className={`${styles.navLink} ${isActive('/bookshelf')}`}>
              <Bookmark className={styles.navIcon} size={18} />
              <span>Bookshelf</span>
            </Link>
          )}
          <Link to="/feedback" className={`${styles.navLink} ${isActive('/feedback')}`}>
            <MessageSquare className={styles.navIcon} size={18} />
            <span>Feedback</span>
          </Link>
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className={`${styles.navLink} ${isActive('/admin')}`}>
              <Settings className={styles.navIcon} size={18} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* THEME SWITCHER */}
        <div className={styles.themeSwitcher}>
          <button 
            onClick={() => toggleTheme('light')}
            className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
            title="Light Mode"
          >
            <Sun size={16} />
          </button>
          <button 
            onClick={() => toggleTheme('dark')}
            className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
            title="Dark Mode"
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={() => toggleTheme('sepia')}
            className={`${styles.themeBtn} ${theme === 'sepia' ? styles.themeBtnActive : ''}`}
            title="Sepia Mode"
          >
            <BookText size={16} />
          </button>
        </div>

        {/* USER MENU */}
        <div className={styles.userMenu}>
          {user ? (
            <>
              {user.isPremium ? (
                <div className={styles.premiumBadgeHeader}>
                  <Gem size={14} style={{ marginRight: '6px' }} />
                  Premium Scholar
                </div>
              ) : (
                <button
                  onClick={() => navigate('/payment')}
                  className={styles.upgradeBtn}
                >
                  <Gem size={16} />
                  Upgrade
                </button>
              )}
              
              <button onClick={() => navigate('/profile')} className={styles.userButton}>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className={styles.userAvatar}
                    title="View Profile"
                  />
                ) : (
                  <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                )}
                {!profilePhoto && (user.fullName || user.name || 'User').split(' ')[0]}
              </button>
              
              <button 
                onClick={() => { localStorage.removeItem('authUser'); setUser(null); navigate('/login'); }} 
                className={styles.userButtonPrimary}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.userButton}>Sign in</Link>
              <Link to="/register" className={styles.userButtonPrimary}>Register</Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.mobileToggle}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* MOBILE NAV OVERLAY - Moved to BottomNav, but keeping it as a fallback for non-nav items if needed, or hiding it */}
        {/* Commented out as it is now redundant with BottomNav */}
        {/*
        {mobileMenuOpen && (
          <nav className={styles.mobileNav}>
            ...
          </nav>
        )}
        */}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onShowSuccess={handleUpgradeSuccess}
      />
    </header>
  );
};

export default Header;
