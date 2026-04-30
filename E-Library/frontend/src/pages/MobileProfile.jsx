import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, Mail, ShieldCheck, Star, BookOpen,
  ChevronRight, Settings, HelpCircle, MessageSquare
} from 'lucide-react';
import styles from './MobileProfile.module.css';
import MobileFeedback from '../components/MobileFeedback';

import { getApiUrl } from '../config/ApiConfig';
const API = getApiUrl(); // already ends with /api

const MobileProfile = () => {
  const navigate = useNavigate();

  // Read synchronously in the useState initializer — runs before any effect,
  // so it works correctly on Capacitor Android where localStorage IS available
  // at render time but can appear null if read asynchronously in useEffect.
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState({ booksRead: 0, booksInShelf: 0 });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Fallback guard: if the synchronous read still returned null (e.g. storage truly
  // unavailable), give the WebView 1 second then re-check before redirecting.
  useEffect(() => {
    if (authUser) return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem('authUser');
        if (raw) {
          setAuthUser(JSON.parse(raw));
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [authUser, navigate]);

  useEffect(() => {
    if (!authUser) return;
    // Fetch bookshelf count
    fetch(`${API}/bookshelf/user/${authUser.id}`)
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, booksInShelf: Array.isArray(data) ? data.length : 0 })))
      .catch(() => {});
    // Fetch reading history count
    fetch(`${API}/activity/user/${authUser.id}`)
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, booksRead: Array.isArray(data) ? data.length : 0 })))
      .catch(() => {});
  }, [authUser]);

  const handleSignOut = () => {
    localStorage.removeItem('authUser');
    navigate('/');
  };

  const initials = (authUser?.fullName || authUser?.name)
    ? (authUser.fullName || authUser.name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={styles.wrapper}>
      {/* Avatar Card */}
      <div className={styles.avatarCard}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarInitials}>{initials}</span>
        </div>
        <h2 className={styles.userName}>{authUser?.fullName || 'Reader'}</h2>
        <p className={styles.userEmail}>{authUser?.email || ''}</p>
        {authUser?.role === 'ADMIN' && (
          <span className={styles.adminBadge}><ShieldCheck size={12} /> Admin</span>
        )}
        {authUser?.isPremium && (
          <span className={styles.premiumBadge}><Star size={12} /> Premium</span>
        )}
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{stats.booksRead}</span>
          <span className={styles.statLabel}>Books Read</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBox}>
          <span className={styles.statNum}>{stats.booksInShelf}</span>
          <span className={styles.statLabel}>On Shelf</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menuCard}>
        <button className={styles.menuItem} onClick={() => navigate('/activity')}>
          <div className={styles.menuIconWrap} style={{ background: 'rgba(99,102,241,0.12)' }}>
            <BookOpen size={18} color="#6366f1" />
          </div>
          <span className={styles.menuLabel}>Activity Dashboard</span>
          <ChevronRight size={16} className={styles.menuArrow} />
        </button>

        <button className={styles.menuItem} onClick={() => navigate('/bookshelf')}>
          <div className={styles.menuIconWrap} style={{ background: 'rgba(20,184,166,0.12)' }}>
            <BookOpen size={18} color="#14b8a6" />
          </div>
          <span className={styles.menuLabel}>My Bookshelf</span>
          <ChevronRight size={16} className={styles.menuArrow} />
        </button>

        <button className={styles.menuItem} onClick={() => setIsFeedbackOpen(true)}>
          <div className={styles.menuIconWrap} style={{ background: 'rgba(251,146,60,0.12)' }}>
            <MessageSquare size={18} color="#fb923c" />
          </div>
          <span className={styles.menuLabel}>Send Feedback</span>
          <ChevronRight size={16} className={styles.menuArrow} />
        </button>

        {authUser?.role === 'ADMIN' && (
          <button className={styles.menuItem} onClick={() => navigate('/admin-dashboard')}>
            <div className={styles.menuIconWrap} style={{ background: 'rgba(239,68,68,0.12)' }}>
              <ShieldCheck size={18} color="#ef4444" />
            </div>
            <span className={styles.menuLabel}>Admin Dashboard</span>
            <ChevronRight size={16} className={styles.menuArrow} />
          </button>
        )}
      </div>

      {/* Sign Out Button */}
      <button className={styles.signOutBtn} onClick={handleSignOut}>
        <LogOut size={18} />
        Sign Out
      </button>

      <p className={styles.version}>E-Library v1.0</p>

      {/* Modern Slide-Up Feedback Bottom Sheet */}
      <MobileFeedback isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
};

export default MobileProfile;
