import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/ApiConfig';
import styles from './MobileStartPage.module.css';
import { BookOpen, Mail, Lock, User } from 'lucide-react';

const MobileStartPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.id) navigate(user.role?.toLowerCase() === 'admin' ? '/admin-dashboard' : '/dashboard');
      } catch (e) {}
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) return setLoginError('Please fill in all fields');
    
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authUser', JSON.stringify(data));
        if (data.role?.toLowerCase() === 'admin') {
          localStorage.setItem('adminSession', 'true');
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName || !signupEmail || !signupPassword) return setSignupError('Please fill in all fields');
    if (signupPassword.length < 6) return setSignupError('Password must be at least 6 characters');

    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: signupName, email: signupEmail, password: signupPassword })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authUser', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        const error = await response.text();
        setSignupError(error || 'Registration failed');
      }
    } catch (err) {
      setSignupError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      
      <div className={styles.glassCard}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <BookOpen size={30} />
          </div>
          <div className={styles.logoText}>Read<span className={styles.accent}>X</span></div>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`} onClick={() => setActiveTab('login')}>Sign In</button>
          <button className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`} onClick={() => setActiveTab('signup')}>Register</button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            {loginError && <div className={styles.errorAlert}>{loginError}</div>}
            <div className={styles.inputGroup}>
              <Mail size={18} />
              <input type="email" placeholder="Email address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={loading} />
            </div>
            <div className={styles.inputGroup}>
              <Lock size={18} />
              <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={loading} />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            {signupError && <div className={styles.errorAlert}>{signupError}</div>}
            <div className={styles.inputGroup}>
              <User size={18} />
              <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} disabled={loading} />
            </div>
            <div className={styles.inputGroup}>
              <Mail size={18} />
              <input type="email" placeholder="Email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} disabled={loading} />
            </div>
            <div className={styles.inputGroup}>
              <Lock size={18} />
              <input type="password" placeholder="Create password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} disabled={loading} />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MobileStartPage;
