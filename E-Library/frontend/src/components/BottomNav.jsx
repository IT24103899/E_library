import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Sparkles, Bookmark, User, Users, ShieldCheck, Key } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const location = useLocation();
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw && raw !== 'null') {
      try {
        const user = JSON.parse(raw);
        setRole(user?.role || 'USER');
      } catch (e) {
        setRole('USER');
      }
    } else {
      setRole('USER');
    }
  }, [location]); // Re-check role on navigation

  // Paths where we don't want to show the bottom nav (e.g., login, register, reading mode)
  const hidePaths = ['/login', '/register', '/admin-login', '/admin-register', '/start', '/', '/logout'];
  const isReader = location.pathname.includes('/reading/');
  
  if (hidePaths.includes(location.pathname) || isReader) {
    return null;
  }

  const isAdmin = role === 'ADMIN';

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {isAdmin ? (
          <>
            <NavLink 
              to="/admin-dashboard?tab=dashboard" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={24} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink 
              to="/admin-dashboard?tab=users" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Users size={24} />
              <span>Users</span>
            </NavLink>

            <NavLink 
              to="/admin-dashboard?tab=books" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Book size={24} />
              <span>Library</span>
            </NavLink>

            <NavLink 
              to="/admin-dashboard?tab=access" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Key size={24} />
              <span>Access</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/activity" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LayoutDashboard size={24} />
              <span>Home</span>
            </NavLink>

            <NavLink 
              to="/books" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Book size={24} />
              <span>Library</span>
            </NavLink>

            <NavLink 
              to="/search" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.searchFab}>
                <Sparkles size={28} />
              </div>
              <span className={styles.fabLabel}>Hub</span>
            </NavLink>

            <NavLink 
              to="/bookshelf" 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Bookmark size={24} />
              <span>Shelf</span>
            </NavLink>
          </>
        )}

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
