
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';
import { API_BASE_URL, getApiUrl } from '../config/ApiConfig';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  // Pre-fill credentials from registration
  useEffect(() => {
    const userEmail = searchParams.get('email');
    const pwd = searchParams.get('password');
    if (userEmail) setEmail(userEmail);
    if (pwd) setPassword(pwd);
    
    // Log API configuration for debugging
    console.log('[Login] API URL configured:', getApiUrl());
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const loginUrl = `${apiUrl}/auth/login`;
      
      console.log('[Login] Attempting login to:', loginUrl);
      console.log('[Login] Email:', email);

      const res = await axios.post(loginUrl, { email, password }, {
        timeout: 10000, // 10 second timeout
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[Login] Success! User:', res.data);

      // Store user data
      localStorage.setItem('authUser', JSON.stringify(res.data));
      setSuccessMsg('Signed in successfully — redirecting...');
      
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      console.error('[Login] Error:', err);

      // Better error messages based on error type
      let errorMsg = 'Login failed';

      if (!err.response) {
        // Network error
        errorMsg = `⚠️ Cannot connect to server. Check if backend is running at: ${getApiUrl()}`;
      } else if (err.response.status === 401 || err.response.status === 400) {
        // Authentication error
        errorMsg = err.response?.data?.error || 'Invalid email or password';
      } else if (err.response.status === 500) {
        // Server error
        errorMsg = 'Server error. Please try again later.';
      } else {
        errorMsg = err.response?.data?.error || errorMsg;
      }

      setError(errorMsg);
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
            <span className={styles.logoIcon}>EL</span>
            <span className={styles.logoText}>E-Library</span>
          </div>
          <div className={styles.heroText}>
            <h1>Welcome Back to <span>Excellence.</span></h1>
            <p>Access your personalized learning dashboard, manage classes, and track your academic progress all in one place.</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>SECURE</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>24/7</span>
              <span className={styles.statLabel}>UPTIME</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileLogo}>
            <span className={styles.logoText}>E-Library</span>
          </div>
          <div className={styles.header}>
            <h2>Sign In</h2>
            <p>Please enter your details to access your account.</p>
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
              <label className={styles.label}>EMAIL ADDRESS</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>PASSWORD</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
              </div>
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
                <>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            Don't have an account? <Link to="/register" className={styles.link}>Create one</Link>
            <div className={styles.adminSection}>
              <Link to="/admin-login" className={styles.adminLink}>
                🛡️ Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
