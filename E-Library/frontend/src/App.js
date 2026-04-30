import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import MobileProfile from './pages/MobileProfile';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
import FeedbackPage from './pages/FeedbackPage';
import Bookshelf from './pages/Bookshelf';
import SearchHub from './pages/SearchHub';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminProfile from './pages/AdminProfile';
import AdminRoute from './components/AdminRoute';
import BottomNav from './components/BottomNav';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import ForceLogout from './pages/ForceLogout';

function AppRoutes() {
  const location = useLocation();
  const { theme } = useTheme();
  const currentTheme = theme || 'light'; // Robust fallback
  const hideHeaderPaths = ['/', '/start', '/admin-dashboard', '/admin', '/admin/profile', '/admin-login', '/admin-register', '/login', '/register', '/payment', '/payment/success', '/payment/cancel', '/profile', '/logout'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  // Scroll to hash fragment on navigation (handles links like /dashboard#recommendations)
  useEffect(() => {
    const hash = location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = hash.replace('#', '');
    const scrollToElement = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Try immediate scroll; if element not mounted yet, retry shortly
    scrollToElement();
    const retry = setTimeout(scrollToElement, 200);
    return () => clearTimeout(retry);
  }, [location]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${currentTheme}`} style={{ background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, #ffffff)' }}>
      {/* Emergency Reset Button (Only visible if something goes wrong or as a fail-safe) */}
      {location.pathname !== '/logout' && (
        <button 
          onClick={() => window.location.href = '/logout'}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 99999,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          FORCE LOGOUT
        </button>
      )}
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<ActivityDashboard />} />
        <Route path="/history" element={<ActivityDashboard />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        <Route path="/search" element={<SearchHub />} />
        
        {/* Payment Routes */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Admin Routes - Separate from User Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        
        {/* Helper Link */}
        <Route path="/logout" element={<ForceLogout />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
