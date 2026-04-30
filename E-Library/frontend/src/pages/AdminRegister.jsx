import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminAuth.module.css';
import { getSpringBootUrl } from '../config/ApiConfig';

const API = getSpringBootUrl();

const AdminRegister = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // Fix API endpoint - backend uses /api context path
  const apiUrl = `${API}/api`;

  // Validation helpers
  const validateEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const passwordStrength = (pw) => {
    // at least 8 chars, one letter and one number
    return /(?=.{8,})(?=.*[A-Za-z])(?=.*\d)/.test(pw);
  };

  const handlePrepare = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (!passwordStrength(password)) return setError('Password must be at least 8 characters with letters and numbers');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!adminCode || adminCode.trim() === '') return setError('Please enter the admin access code');
    
    setConfirmOpen(true);
  };

  const handleConfirmRegister = async () => {
    setConfirmOpen(false);
    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/auth/register`, {
        fullName,
        email,
        password,
        role: 'ADMIN',
        adminCode // Backend will verify this
      });

      // Verify response is ADMIN
      if (res.data.role !== 'ADMIN') {
        setError('Registration returned non-admin user. Contact system administrator.');
        return;
      }

      localStorage.setItem('authUser', JSON.stringify(res.data));
      localStorage.setItem('adminSession', 'true');
      setSuccessMsg('Admin account created successfully — redirecting to admin panel...');
      setTimeout(() => navigate('/admin-dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Invalid admin code or server error.');
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
            <span className={styles.adminLogoIcon}>🔐</span>
            <span className={styles.logoText}>E-Library</span>
          </div>
          <div className={styles.heroText}>
            <h1>Secure <span>Provisioning.</span></h1>
            <p>Request administrative credentials through our multi-layer verification process. Access is exclusive to authorized personnel.</p>
          </div>
          <div className={styles.adminFeatures}>
            <div className={styles.featureItem}>✓ Mandatory Access Code</div>
            <div className={styles.featureItem}>✓ Secure Identity Verification</div>
            <div className={styles.featureItem}>✓ Full System Audit Trail</div>
            <div className={styles.featureItem}>✓ Encrypted Credential Storage</div>
          </div>
          <div className={styles.adminNotice}>
             <strong>Administrative Protocol</strong><br/>
             Contact the head administrator to receive your unique authorization code. 
          </div>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileLogo}>
            <span className={styles.logoText}>Admin Access</span>
          </div>
          <div className={styles.header}>
            <h2>Request Access</h2>
            <p>Initiate the admin onboarding protocol.</p>
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

          <form onSubmit={handlePrepare} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  className={styles.input}
                  placeholder="Official Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ADMIN EMAIL</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  className={styles.input}
                  placeholder="admin@elibrary.lk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SECURE PASSWORD</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔐</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="8+ characters..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.hint}>
                {password && (
                  passwordStrength(password) ? 
                  <span className={styles.strengthGood}>✓ Strength: Secure</span> : 
                  <span className={styles.strengthWeak}>⚠ Strength: Insufficient</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔐</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Confirm password..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>AUTHORIZATION CODE</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🛡️</span>
                <input
                  className={styles.input}
                  placeholder="Required field..."
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  type="password"
                  required
                />
              </div>
            </div>

            <button className={styles.submitBtn} disabled={loading} type="submit">
              {loading ? (
                <span className={styles.loader}></span>
              ) : (
                <span>Request Credentials</span>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            Already have access? <Link to="/admin-login" className={styles.link}>Sign in</Link>
            <div className={styles.backSection}>
              <Link to="/login" className={styles.backLink}>
                ← Back to User Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3>Verify Identity</h3>
            <p>Initialize administrator account for <strong>{fullName}</strong>?</p>
            <div className={styles.confirmDetails}>
              <div>Email: {email}</div>
              <div>Privilege: SYSTEM ADMIN</div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setConfirmOpen(false)} className={styles.cancelBtn}>Decline</button>
              <button onClick={handleConfirmRegister} className={styles.confirmBtn} disabled={loading}>
                {loading ? 'Processing...' : 'Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegister;
