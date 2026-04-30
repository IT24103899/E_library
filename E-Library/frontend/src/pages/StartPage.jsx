import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/ApiConfig';
import styles from './StartPage.module.css';
import {
  BookOpen, Sparkles, ArrowRight, Search, Heart,
  Users, Zap, Mail, Lock, User, Star, Quote, CheckCircle, Compass
} from 'lucide-react';
import MobileStartPage from './MobileStartPage';
import { isAndroid } from '../config/ApiConfig';

/* eslint-disable no-undef */
const StartPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState([]);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Define default books function first
  const getDefaultBooks = () => [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', image: 'https://covers.openlibrary.org/b/id/7725670-M.jpg' },
    { id: 2, title: 'Pride & Prejudice', author: 'Jane Austen', image: 'https://covers.openlibrary.org/b/id/7725632-M.jpg' },
    { id: 3, title: 'Dune', author: 'Frank Herbert', image: 'https://covers.openlibrary.org/b/id/7885802-M.jpg' },
    { id: 4, title: '1984', author: 'George Orwell', image: 'https://covers.openlibrary.org/b/id/7725720-M.jpg' },
  ];

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.id) navigate(user.role?.toLowerCase() === 'admin' ? '/admin-dashboard' : '/dashboard');
      } catch (e) { }
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  // Fetch books from database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/books`);
        if (response.ok) {
          const books = await response.json();
          const featured = books.slice(0, 4).map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            image: book.coverImage || book.cover_image || 'https://images.unsplash.com/photo-1507842217343-583b90753785?w=400&h=600&fit=crop'
          }));
          setFeaturedBooks(featured.length > 0 ? featured : getDefaultBooks());
        } else {
          setFeaturedBooks(getDefaultBooks());
        }
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setFeaturedBooks(getDefaultBooks());
      }
    };
    fetchBooks();
  }, []);

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
        navigate(data.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
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
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) return setSignupError('Please fill in all fields');
    if (signupPassword !== signupConfirm) return setSignupError('Passwords do not match');
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

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    { name: 'Science Fiction', color: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    { name: 'Business & Tech', color: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: 'Romance', color: 'linear-gradient(135deg, #f43f5e, #be123c)' },
    { name: 'Mystery & Thriller', color: 'linear-gradient(135deg, #64748b, #334155)' },
  ];

  // Safely trigger Mobile App mode without breaking React Hooks stack!
  if (isAndroid()) {
    return <MobileStartPage />;
  }

  return (
    <div className={styles.wrapper}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><BookOpen size={24} /></div>
            <span>Read<span className={styles.accent}>X</span></span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#collection">Collection</a>
            <a href="#pricing">Pricing</a>
            <button className={styles.navBtn} onClick={() => scrollToSection('auth-section')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={`${styles.hero} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.tag}>
              <Sparkles size={16} /> <span>Next Generation Reading</span>
            </div>
            <h1 className={styles.heroTitle}>
              Your infinite library, <br />
              <span className={styles.textGradient}>anywhere you go.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Dive into thousands of curated books, research papers, and audiobooks. ReadX adapts to your style, bringing the world's knowledge right to your fingertips.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primaryBtn} onClick={() => scrollToSection('auth-section')}>
                Start Reading <ArrowRight size={18} />
              </button>
              <div className={styles.statsRow}>
                <div className={styles.statItem}><strong>10k+</strong><span>Books</span></div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}><strong>5k+</strong><span>Readers</span></div>
              </div>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1000&auto=format&fit=crop"
              alt="Reading app"
              className={styles.heroImage}
            />
            <div className={styles.floatingCard}>
              <Heart size={20} className={styles.heartIcon} />
              <div>
                <strong>Top Rated</strong>
                <span>4.9/5 from users</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Showcase */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Readers Love Us</h2>
          <p>Everything you need for the perfect reading experience.</p>
        </div>
        <div className={styles.featureGrid}>
          {[
            { icon: <Search size={24} />, title: "Smart Discovery", desc: "AI-powered recommendations based on your unique reading history." },
            { icon: <Heart size={24} />, title: "Curated Shelves", desc: "Build custom collections and share them with the community." },
            { icon: <Users size={24} />, title: "Global Community", desc: "Discuss chapters and review books with readers worldwide." },
            { icon: <Zap size={24} />, title: "Instant Sync", desc: "Start on your phone, pick up exactly where you left off on desktop." }
          ].map((feat, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featIcon}>{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Browse by Category */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2>Explore by Genre</h2>
          <p>Find your next obsession among our top categories.</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <div key={idx} className={styles.categoryCard} style={{ background: cat.color }}>
              <Compass size={32} color="white" />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section id="collection" className={styles.collection}>
        <div className={styles.sectionHeader}>
          <h2>Trending This Week</h2>
        </div>
        <div className={styles.bookGrid}>
          {featuredBooks.map(book => (
            <div key={book.id} className={styles.bookCard}>
              <div className={styles.bookCover}>
                <img src={book.image} alt={book.title} />
              </div>
              <div className={styles.bookInfo}>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2>What Our Community Says</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {[
            { name: "Sarah J.", role: "Avid Reader", quote: "ReadX completely changed how I consume books. The AI recommendations are spot on every single time." },
            { name: "Marcus T.", role: "Student", quote: "Having my entire research library synced between my phone and laptop has saved me countless hours." },
            { name: "Elena R.", role: "Book Club Host", quote: "The community features let me share my curated shelves with my friends instantly. It's brilliant." }
          ].map((review, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <Quote size={32} className={styles.quoteIcon} />
              <p>"{review.quote}"</p>
              <div className={styles.reviewer}>
                <div className={styles.avatar}>{review.name.charAt(0)}</div>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Pricing */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <h2>Simple, Transparent Pricing</h2>
          <p>Start for free, upgrade when you need more power.</p>
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3>Basic Reader</h3>
            <div className={styles.price}>$0<span>/month</span></div>
            <ul>
              <li><CheckCircle size={18} /> Access to 5,000+ free classics</li>
              <li><CheckCircle size={18} /> Basic reading interface</li>
              <li><CheckCircle size={18} /> Sync across 2 devices</li>
            </ul>
            <button className={styles.outlineBtn} onClick={() => scrollToSection('auth-section')}>Sign Up Free</button>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingPro}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <h3>Premium Scholar</h3>
            <div className={styles.price}>$9.99<span>/month</span></div>
            <ul>
              <li><CheckCircle size={18} /> Unlimited access to all 10k+ books</li>
              <li><CheckCircle size={18} /> AI-powered recommendations</li>
              <li><CheckCircle size={18} /> Unlimited device syncing</li>
              <li><CheckCircle size={18} /> Offline reading mode</li>
            </ul>
            <button className={styles.primaryBtnFull} onClick={() => scrollToSection('auth-section')}>Get Premium</button>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className={styles.authSection}>
        <div className={styles.authWrapper}>
          <div className={styles.authLeft}>
            <h2>Join the club.</h2>
            <p>Create an account to unlock unlimited access to our entire library.</p>
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop" alt="Library" />
          </div>

          <div className={styles.authRight}>
            <div className={styles.authTabs}>
              <button className={activeTab === 'login' ? styles.activeTab : ''} onClick={() => setActiveTab('login')}>Sign In</button>
              <button className={activeTab === 'signup' ? styles.activeTab : ''} onClick={() => setActiveTab('signup')}>Register</button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className={styles.form}>
                {loginError && <div className={styles.errorAlert}>{loginError}</div>}
                <div className={styles.inputGroup}>
                  <Mail size={18} />
                  <input type="email" placeholder="Email address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={loading} />
                </div>
                <div className={styles.inputGroup}>
                  <Lock size={18} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={loading} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className={styles.form}>
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
                  <input type={showPassword ? "text" : "password"} placeholder="Create password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} disabled={loading} />
                </div>
                <div className={styles.inputGroup}>
                  <Lock size={18} />
                  <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} disabled={loading} />
                </div>
                <label className={styles.checkbox}>
                  <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show passwords
                </label>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.logo}><BookOpen size={20} /><span>Read<span className={styles.accent}>X</span></span></div>
        <p>&copy; 2026 ReadX Digital Library. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StartPage;