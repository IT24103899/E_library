import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminAuth.module.css';
import { getSpringBootUrl } from '../config/ApiConfig';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  // Always hit Spring Boot (port 8080) for admin auth — works on web and Android emulator (10.0.2.2)
  const apiUrl = getSpringBootUrl() + '/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      
      // Verify admin role
      if (res.data.role !== 'ADMIN') {
        setError('Only admins can access the admin portal. Please use the regular login.');
        return;
      }

      localStorage.setItem('authUser', JSON.stringify(res.data));
      localStorage.setItem('adminSession', 'true');
      setSuccessMsg('Admin credentials verified — redirecting to admin panel...');
      setTimeout(() => navigate('/admin-dashboard'), 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.overlay}></div>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <span className={styles.adminLogoIcon}>🛡️</span>
            <span className={styles.logoText}>E-Library</span>
          </div>
          <div className={styles.heroText}>
            <h1>Admin <span>Portal.</span></h1>
            <p>Secure management sanctuary for administrators. Oversee the library ecosystem and manage scholarly content with precision.</p>
          </div>
          <div className={styles.adminFeatures}>
            <div className={styles.featureItem}>✓ User Management</div>
            <div className={styles.featureItem}>✓ Book & Resource Control</div>
            <div className={styles.featureItem}>✓ Real-time Analytics</div>
            <div className={styles.featureItem}>✓ System Configuration</div>
          </div>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileLogo}>
            <span className={styles.logoText}>E-Library Admin</span>
          </div>
          <div className={styles.header}>
            <h2>Admin Login</h2>
            <p>Access the control center with your credentials.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.alertIcon}>⚠️</span>
              {error}
            </div>
          )}
          {successMsg && (
            <div className={styles.successAlert}>
              <span className={styles.alertIcon}>✓</span>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>ADMIN EMAIL</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  className={styles.input}
                  placeholder="admin@elibrary.lk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔐</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button className={styles.submitBtn} disabled={loading} type="submit">
              {loading ? (
                <span className={styles.loader}></span>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            Need admin access? <Link to="/admin-register" className={styles.link}>Request here</Link>
            <div className={styles.backSection}>
              <Link to="/login" className={styles.backLink}>
                ← Back to User Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
