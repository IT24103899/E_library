
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !fullName || password.length < 6) {
      setError('Please fill all fields. Password should be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/auth/register`, { email, fullName, password, role });
      // Auto-login (server returns user info)
      localStorage.setItem('authUser', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation helpers
  const validateEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const passwordStrength = (pw) => {
    // at least 8 chars, one letter and one number
    return /(?=.{8,})(?=.*[A-Za-z])(?=.*\d)/.test(pw);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const prepareSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (!passwordStrength(password)) return setError('Password must be at least 8 characters and include letters and numbers');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setConfirmOpen(true);
  };

  const confirmCreate = async () => {
    setConfirmOpen(false);
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/auth/register`, { fullName, email, password, role });
      localStorage.setItem('authUser', JSON.stringify(res.data));
      setSuccessMsg('Account created successfully — redirecting...');
      setTimeout(() => {
        // Navigate to login with pre-filled credentials
        navigate(`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
            <h1>Embark on your <span>Journey.</span></h1>
            <p>Join a community of scholars and access a world of knowledge. Securely create your account to begin your academic evolution.</p>
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
            <h2>Create Account</h2>
            <p>Join our sanctuary of excellence today.</p>
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

          <form onSubmit={prepareSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  className={styles.input}
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ACCOUNT TYPE</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🏷️</span>
                <select 
                  className={styles.select} 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="USER">User / Scholar</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  placeholder="Strong password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className={styles.hint}>Min 8 characters, include numbers and letters.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔁</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Repeat password..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className={styles.submitBtn} disabled={loading} type="submit">
              {loading ? (
                <span className={styles.loader}></span>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3>Confirm Registration</h3>
            <p>Create account for <strong>{fullName}</strong> ({email})?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setConfirmOpen(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmCreate} className={styles.confirmBtn} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
