import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, BookOpen, MessageSquare, Key, LogOut, 
  Clock, Calendar, Zap, Database, Activity, ChevronRight, 
  Trash2, ShieldAlert, Edit, Plus, CheckCircle, Search,
  ShieldCheck, UserCircle, Sun, Moon
} from 'lucide-react';
import styles from './AdminDashboard.module.css';
import AdminAccessRequests from '../components/AdminAccessRequests';
import { useTheme } from '../context/ThemeContext';

import { getSpringBootUrl, isAndroid } from '../config/ApiConfig';
const API = getSpringBootUrl();
const adminLoginPath = isAndroid() ? '/' : '/admin-login';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('authUser');
    if (raw && raw !== 'null' && raw !== 'undefined') {
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
    return null;
  });
  const mountedRef = useRef(true);
  const { theme, toggleTheme } = useTheme();

  // Distinct verification state to debug visibility
  const [protocolVerified, setProtocolVerified] = useState(false);

  useEffect(() => {
    if (user) setProtocolVerified(true);
  }, [user]);

  // Verify admin role (case-insensitive — MongoDB uses 'admin', Spring Boot uses 'ADMIN')
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate(adminLoginPath);
    }
  }, [user, navigate]);

  // Statistics
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Users Management
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ fullName: '', email: '', role: 'USER' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ userId: null, newPassword: '', confirmPassword: '' });

  // Books Management
  const [books, setBooks] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    totalPages: '',
    category: 'Fiction',
    publicationYear: new Date().getFullYear(),
    pdfUrl: '',
    coverUrl: '',
    content: '',
    isAvailable: true,
  });
  const [bookSearchTerm, setBookSearchTerm] = useState('');

  const filteredBooks = useMemo(() => {
    return books.filter(b => 
      b.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(bookSearchTerm.toLowerCase()))
    );
  }, [books, bookSearchTerm]);

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState([]);

  // Active Tab synchronized with search params for BottomNav support
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const booksRes = await axios.get(`${API}/api/books`);
      if (!user) return; // Safety check
      const usersRes = await axios.get(`${API}/api/admin/users?userId=${user.id}`);
      
      if (!mountedRef.current) return;

      setStats({
        totalBooks: Array.isArray(booksRes.data) ? booksRes.data.length : 0,
        totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
        totalActivity: 0, // Can be expanded later
      });
    } catch (e) {
      console.error('Failed to fetch stats', e);
      setStatusMessage('Failed to fetch statistics');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      if (!user) return; // Safety check
      const res = await axios.get(`${API}/api/admin/users?userId=${user.id}`);
      if (!mountedRef.current) return;
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch users', e);
      setStatusMessage('Failed to fetch users');
    }
  };

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API}/api/books`);
      if (!mountedRef.current) return;
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch books', e);
      setStatusMessage('Failed to fetch books');
    }
  };

  // Fetch Feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/feedback`);
      if (!mountedRef.current) return;
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch feedbacks', e);
      setStatusMessage('Failed to fetch feedbacks');
    }
  };

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') return; // Don't fetch if not admin
    
    mountedRef.current = true;
    fetchStats();
    fetchUsers();
    fetchBooks();
    fetchFeedbacks();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line
  }, [user]); // Re-run when user session is loaded

  // USER CRUD OPERATIONS
  const handleCreateUser = async () => {
    if (!userFormData.fullName || !userFormData.email) {
      setStatusMessage('Please fill all user fields');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/admin/users?userId=${user.id}`, {
        fullName: userFormData.fullName,
        email: userFormData.email,
        role: userFormData.role,
      });
      setUsers([...users, res.data]);
      setUserFormData({ fullName: '', email: '', role: 'USER' });
      setShowUserForm(false);
      setStatusMessage('User created successfully');
    } catch (e) {
      setStatusMessage('Failed to create user: ' + (e.response?.data?.error || e.message));
    }
  };



  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API}/api/admin/users/${userId}?userId=${user.id}`);
        setUsers(users.filter(u => u.id !== userId));
        setStatusMessage('User deleted successfully');
      } catch (e) {
        setStatusMessage('Failed to delete user: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await axios.put(`${API}/api/admin/users/${userId}/role?userId=${user.id}&role=${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
      setStatusMessage('User role changed successfully');
    } catch (e) {
      setStatusMessage('Failed to change user role');
    }
  };

  const handleResetPasswordClick = (userId) => {
    setResetPasswordData({ userId, newPassword: '', confirmPassword: '' });
    setShowResetPassword(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      setStatusMessage('Please fill all password fields');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setStatusMessage('Passwords do not match');
      return;
    }
    try {
      const res = await axios.put(
        `${API}/admin/users/${resetPasswordData.userId}/reset-password?userId=${user.id}`,
        { newPassword: resetPasswordData.newPassword }
      );
      setStatusMessage(`Password reset successfully! Temp password: ${res.data.tempPassword}`);
      setShowResetPassword(false);
      setResetPasswordData({ userId: null, newPassword: '', confirmPassword: '' });
    } catch (e) {
      setStatusMessage('Failed to reset password: ' + (e.response?.data?.error || e.message));
    }
  };

  // BOOK CRUD OPERATIONS
  const handleCreateBook = async () => {
    if (!bookFormData.title || !bookFormData.author) {
      setStatusMessage('Please fill title and author');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/books?userId=${user.id}`, bookFormData);
      setBooks([...books, res.data]);
      setBookFormData({ 
        title: '', 
        author: '', 
        description: '', 
        isbn: '',
        totalPages: '',
        category: 'Fiction',
        publicationYear: new Date().getFullYear(),
        pdfUrl: '',
        coverUrl: '',
        content: '',
        isAvailable: true,
      });
      setShowBookForm(false);
      setStatusMessage('Book created successfully');
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to create book: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      isbn: book.isbn || '',
      totalPages: book.totalPages || '',
      category: book.category || 'Fiction',
      publicationYear: book.publicationYear || new Date().getFullYear(),
      pdfUrl: book.pdfUrl || '',
      coverUrl: book.coverUrl || '',
      content: book.content || '',
      isAvailable: book.isAvailable !== undefined ? book.isAvailable : true,
    });
    setShowBookForm(true);
  };

  const handleUpdateBook = async () => {
    if (!bookFormData.title || !bookFormData.author) {
      setStatusMessage('Please fill title and author');
      return;
    }
    try {
      const res = await axios.put(`${API}/api/books/${editingBook.id}`, bookFormData);
      setBooks(books.map(b => b.id === editingBook.id ? res.data : b));
      setEditingBook(null);
      setBookFormData({
        title: '', author: '', description: '', isbn: '', totalPages: '',
        category: 'Fiction', publicationYear: new Date().getFullYear(),
        pdfUrl: '', coverUrl: '', content: '', isAvailable: true,
      });
      setShowBookForm(false);
      setStatusMessage('Book updated successfully');
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to update book: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API}/api/books/${bookId}`);
        setBooks(books.filter(b => b.id !== bookId));
        setStatusMessage('Book deleted successfully');
      } catch (e) {
        console.error(e);
        setStatusMessage('Failed to delete book: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  // FEEDBACK CRUD OPERATIONS
  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/v1/feedback/${id}/status`, { status });
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f));
      setStatusMessage(`Feedback marked as ${status}`);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to update feedback status');
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('adminSession');
      navigate('/admin-login');
    }
  };

  if (!protocolVerified || !user) {
    return (
      <div style={{ 
        background: '#020617', 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#6366f1',
        zIndex: 9999 
      }}>
        <Zap size={64} className="animate-pulse" style={{ opacity: 0.8 }} />
        <h2 style={{ 
          marginTop: '1.5rem', 
          letterSpacing: '4px', 
          textTransform: 'uppercase', 
          fontSize: '0.9rem',
          fontWeight: 800
        }}>System Protocol: Verifying</h2>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboard}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoIcon}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div className={styles.logoText}>
            <h2>Admin<span className={styles.highlight}>Core</span></h2>
            <p>System Command v2.0</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className={styles.navIcon} size={20} /> Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className={styles.navIcon} size={20} /> User Matrix
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'books' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <BookOpen className={styles.navIcon} size={20} /> Book Registry
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'feedback' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <MessageSquare className={styles.navIcon} size={20} /> User Pulse
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'access' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('access')}
          >
            <Key className={styles.navIcon} size={20} /> Access Control
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <ShieldAlert size={18} color="var(--admin-accent)" />
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userRole}>Root Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Terminate Session
          </button>
        </div>

        {/* Theme Switcher */}
        <div className={styles.themeSwitcher}>
          <p className={styles.themeSwitcherLabel}>Theme</p>
          <div className={styles.themeOptions}>
            <button
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
              onClick={() => toggleTheme('light')}
              title="Light Mode"
            >
              <div className={styles.themeBtnIcon}><Sun size={14} /></div>
              Light
            </button>
            <button
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
              onClick={() => toggleTheme('dark')}
              title="Dark Mode"
            >
              <div className={styles.themeBtnIcon}><Moon size={14} /></div>
              Dark
            </button>
            <button
              className={`${styles.themeBtn} ${theme === 'sepia' ? styles.themeBtnActive : ''}`}
              onClick={() => toggleTheme('sepia')}
              title="Sepia Mode"
            >
              <div className={styles.themeBtnIcon}>📖</div>
              Sepia
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Top Header Section */}
        {/* Dashboard Tab uses the Hero Banner, others use Top Header */}
        {activeTab === 'dashboard' ? (
          <header className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Activity size={14} color="var(--admin-accent)" />
                <span style={{ 
                  color: 'var(--admin-accent)', 
                  fontWeight: 800, 
                  letterSpacing: '1px', 
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>System Status: Optimal // Core v2.0</span>
              </div>

              {/* Mobile Only Header (New) */}
              <div className={styles.mobileOnlyHeader}>
                <div className={styles.mobileLogo}>
                  <Zap size={20} fill="#818CF8" color="#818CF8" />
                  <span>AdminCore</span>
                </div>
                <button className={styles.mobileLogout} onClick={handleLogout}>
                  <LogOut size={18} />
                </button>
              </div>

              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Welcome, <span className={styles.heroHighlight}>{user?.fullName || 'Root'}</span>
              </h1>
              <p style={{ opacity: 0.7, maxWidth: '600px' }}>Managing the Digital Library ecosystem with real-time sync and security protocols.</p>
            </div>

            <div className={styles.heroWidgets}>
              <div className={styles.heroWidgetCard}>
                <Clock size={18} color="var(--admin-accent)" />
                <div>
                  <span className={styles.widgetLabel}>System Time</span>
                  <span className={styles.widgetData}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
              </div>
              <div className={styles.heroWidgetCard}>
                <Database size={18} color="var(--admin-accent)" />
                <div>
                  <span className={styles.widgetLabel}>Node Status</span>
                  <span className={styles.widgetData}>Connected</span>
                </div>
              </div>
            </div>
            
            <div className={styles.heroShapes}>
              <div className={styles.shape1}></div>
              <div className={styles.shape2}></div>
            </div>
          </header>
        ) : (
          <header className={styles.topHeader}>
            <div className={styles.headerTitles}>
              <h1 className={styles.pageTitle}>
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'books' && 'Book Management'}
                {activeTab === 'feedback' && 'User Feedback'}
                {activeTab === 'access' && 'Admin Access Requests'}
              </h1>
              <p className={styles.pageSubtitle}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={styles.statusMessage}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className={styles.closeStatus}>✕</button>
          </div>
        )}

        <div className={styles.contentWrapper}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className={`${styles.dashboardSection} ${styles.fadeIn}`}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <BookOpen className={styles.statIcon} size={24} />
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>Library Index</div>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalBooks}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <Users className={styles.statIcon} size={24} />
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>Active Nodes</div>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalUsers}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <Activity className={styles.statIcon} size={24} />
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>Pulse Rate</div>
                    <div className={styles.statValue}>Optimal</div>
                  </div>
                </div>
              </div>

              <div className={styles.dashboardWidgetsGrid}>
                {/* System Status & Actions */}
                <div className={styles.widgetColumn}>
                  <div className={styles.quickActions}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionButtons}>
                      <button onClick={() => setActiveTab('users')} className={styles.actionBtn}>
                         Manage Users
                      </button>
                      <button onClick={() => setActiveTab('books')} className={styles.actionBtn}>
                         Manage Books
                      </button>
                      <button onClick={() => { setShowUserForm(true); setActiveTab('users'); }} className={styles.actionBtnSecondary}>
                        + Add New User
                      </button>
                      <button onClick={() => { setShowBookForm(true); setActiveTab('books'); }} className={styles.actionBtnSecondary}>
                        + Add New Book
                      </button>
                    </div>
                  </div>

                  <div className={styles.systemStatusCard}>
                    <h3>⚙️ System Status</h3>
                    <ul className={styles.statusList}>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🌐</span>
                          <span className={styles.statusText}>API Connectivity</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>Operational</span>
                      </li>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🗄️</span>
                          <span className={styles.statusText}>Database Instance</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>Connected</span>
                      </li>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🔥</span>
                          <span className={styles.statusText}>Server Load</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeWarning}`}>Moderate (42%)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className={styles.activityFeedCard}>
                  <div className={styles.activityHeader}>
                    <h3><Activity size={18} color="var(--admin-accent)" /> Recent System Events</h3>
                    <button className={styles.viewAllBtn}>Logs</button>
                  </div>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}><Plus size={14} /></div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}><strong>Node Expansion:</strong> New user registry synchronized.</p>
                        <span className={styles.timelineTime}>Moment ago</span>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}><CheckCircle size={14} /></div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}><strong>Backup Integrity:</strong> Scheduled snapshot successful.</p>
                        <span className={styles.timelineTime}>2 hours ago</span>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}><Database size={14} /></div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}><strong>Registry Update:</strong> New volume metadata indexed.</p>
                        <span className={styles.timelineTime}>System Cycle 4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className={`${styles.usersSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Registered Users</h2>
                <button 
                  onClick={() => setShowUserForm(true)}
                  className={styles.addBtn}
                >
                  <span className={styles.btnIcon}>+</span> Add New User
                </button>
              </div>

              {showUserForm && (
                <div className={styles.formCard}>
                  <h3>Create New User</h3>
                  <div className={styles.formGrid}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userFormData.fullName}
                      onChange={e => setUserFormData({...userFormData, fullName: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={userFormData.email}
                      onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                      className={styles.formInput}
                    />
                    <select
                      value={userFormData.role}
                      onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                      className={styles.formInput}
                    >
                      <option value="USER">Standard User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
              <div className={styles.formButtons}>
                    <button onClick={handleCreateUser} className={styles.saveBtn}>Save User</button>
                    <button onClick={() => setShowUserForm(false)} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}

              <div className={styles.usersGrid}>
                {users.map(u => (
                  <div key={u.id} className={`${styles.userCard} ${u.role === 'ADMIN' ? styles.adminCardElite : ''}`}>
                    <div className={styles.userCardHeader}>
                      <div className={`${styles.cellAvatarElite} ${u.role === 'ADMIN' ? styles.avatarAdminElite : styles.avatarUserElite}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={32} /> : <UserCircle size={32} />}
                        <span className={`${styles.pulseIndicatorElite} ${styles.pulseOnlineElite}`}></span>
                      </div>
                      <div className={styles.userCardInfo}>
                        <div className={styles.nameRowElite}>
                          <h4 className={styles.userCardNameElite}>{u.fullName}</h4>
                          <div className={styles.nodeStatusTag}>
                            {u.role === 'ADMIN' ? 'MASTER NODE' : 'DATA STREAM'}
                          </div>
                        </div>
                        <p className={styles.userCardEmailElite}>{u.email}</p>
                      </div>
                    </div>

                    <div className={styles.nodeMetaMatrix}>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>NODE SIGNATURE</span>
                        <span className={styles.metaValue}>#{u.id}</span>
                      </div>
                      <div className={styles.metaDividerVertical}></div>
                      <div className={styles.metaBlock} style={{textAlign: 'right'}}>
                        <span className={styles.metaLabel}>GATEWAY ROLE</span>
                        <span className={`${styles.roleBadgeElite} ${u.role === 'ADMIN' ? styles.roleAdminElite : styles.roleUserElite}`}>
                          {u.role === 'ADMIN' ? 'Matrix Administrator' : 'Sanctuary Node'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.userCardActionsElite}>
                      <button onClick={() => handleResetPasswordClick(u.id)} className={styles.tacticalBtn}>
                        <Key size={14} /> RESET GATEWAY
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className={`${styles.tacticalBtn} ${styles.btnPurgeElite}`}>
                        <Trash2 size={14} /> PURGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div className={`${styles.booksSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <div className={styles.headerLeft}>
                  <h2 className={styles.sectionTitle}>Library Catalog Registry</h2>
                  <p className={styles.sectionSubtitle}>{filteredBooks.length} assets currently indexed</p>
                </div>
                
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search by Title, Author, or ISBN..." 
                    className={styles.searchInput}
                    value={bookSearchTerm}
                    onChange={(e) => setBookSearchTerm(e.target.value)}
                  />
                </div>

                <div className={styles.headerActions}>
                  <button onClick={() => setShowBookForm(!showBookForm)} className={styles.addBtn}>
                    {showBookForm ? 'Cancel Operation' : '+ Add New Asset'}
                  </button>
                </div>
              </div>

              {showBookForm && (
                <div className={styles.formCard}>
                  <h3>{editingBook ? 'Edit Book' : 'Register New Book'}</h3>
                  <div className={styles.formGrid}>
                    <input
                      type="text"
                      placeholder="Book Title"
                      value={bookFormData.title}
                      onChange={e => setBookFormData({...bookFormData, title: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="text"
                      placeholder="Author Name"
                      value={bookFormData.author}
                      onChange={e => setBookFormData({...bookFormData, author: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="text"
                      placeholder="ISBN Number"
                      value={bookFormData.isbn}
                      onChange={e => setBookFormData({...bookFormData, isbn: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="number"
                      placeholder="Total Pages"
                      value={bookFormData.totalPages}
                      onChange={e => setBookFormData({...bookFormData, totalPages: e.target.value})}
                      className={styles.formInput}
                    />
                    <select
                      value={bookFormData.category}
                      onChange={e => setBookFormData({...bookFormData, category: e.target.value})}
                      className={styles.formInput}
                    >
                      <option>Fiction</option>
                      <option>Non-Fiction</option>
                      <option>Mystery</option>
                      <option>Thriller</option>
                      <option>Romance</option>
                      <option>Science Fiction</option>
                      <option>Fantasy</option>
                      <option>Biography</option>
                      <option>History</option>
                      <option>Self-Help</option>
                      <option>Other</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Publication Year"
                      value={bookFormData.publicationYear}
                      onChange={e => setBookFormData({...bookFormData, publicationYear: parseInt(e.target.value)})}
                      className={styles.formInput}
                    />
                  </div>
                  
                  <textarea
                    placeholder="Book Description & Synopsis"
                    value={bookFormData.description}
                    onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                    className={styles.formTextarea}
                    rows="3"
                  />

                  <input
                    type="url"
                    placeholder="Cover URL (e.g., https://covers.example.com/cover.jpg)"
                    value={bookFormData.coverUrl}
                    onChange={e => setBookFormData({...bookFormData, coverUrl: e.target.value})}
                    className={styles.formUrlInput}
                  />

                  <input
                    type="url"
                    placeholder="PDF URL (e.g., http://localhost:8080/files/book.pdf)"
                    value={bookFormData.pdfUrl}
                    onChange={e => setBookFormData({...bookFormData, pdfUrl: e.target.value})}
                    className={styles.formUrlInput}
                  />

                  <textarea
                    placeholder="Book Content (paste full text or leave empty if using PDF)"
                    value={bookFormData.content}
                    onChange={e => setBookFormData({...bookFormData, content: e.target.value})}
                    className={styles.formTextarea}
                    rows="4"
                  />

                  <label className={styles.formCheckbox}>
                    <input
                      type="checkbox"
                      checked={bookFormData.isAvailable}
                      onChange={e => setBookFormData({...bookFormData, isAvailable: e.target.checked})}
                    />
                    {' '}Book is Available
                  </label>

                  <div className={styles.formButtons}>
                    {editingBook ? (
                      <button onClick={handleUpdateBook} className={styles.saveBtn}>Update Book</button>
                    ) : (
                      <button onClick={handleCreateBook} className={styles.saveBtn}>Save Book</button>
                    )}
                    <button onClick={() => { setShowBookForm(false); setEditingBook(null); setBookFormData({ title: '', author: '', description: '', isbn: '', totalPages: '', category: 'Fiction', publicationYear: new Date().getFullYear(), pdfUrl: '', coverUrl: '', content: '', isAvailable: true }); }} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}

              <div className={styles.booksGrid}>
                {filteredBooks.map(b => (
                  <div key={b.id} className={styles.bookCard}>
                    <div className={styles.bookCardInner}>
                      <div className={styles.bookIcon}>
                        {b.coverUrl ? (
                          <img src={b.coverUrl} alt={b.title} className={styles.bookCoverImg} />
                        ) : (
                          <BookOpen size={20} color="var(--admin-accent)" />
                        )}
                      </div>
                      <div className={styles.bookDetails}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 title={b.title}>{b.title}</h4>
                          <span className={styles.categoryTag}>{b.category || 'General'}</span>
                        </div>
                        <p className={styles.bookAuthor}>{b.author}</p>
                        
                        <div className={styles.bookMetaRow}>
                          <div className={styles.statusGroup}>
                            <span className={`${styles.statusDot} ${b.isAvailable ? styles.statusOnline : styles.statusOffline}`}></span>
                            <span>{b.isAvailable ? 'Available' : 'Out of Stock'}</span>
                          </div>
                          <div className={styles.metaDivider}></div>
                          <span>ISBN: {b.isbn || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <p className={styles.bookDescription}>{b.description}</p>
                    <div className={styles.bookActions}>
                      <button
                        onClick={() => handleEditBook(b)}
                        className={styles.cardActionBtn}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(b.id)}
                        className={styles.btnDeleteSolid}
                      >
                        <Trash2 size={14} /> Purge Registry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className={`${styles.usersSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>User Feedback & Requests</h2>
              </div>

              <div className={styles.usersGrid}>
                {feedbacks.map(f => (
                  <div key={f.id} className={styles.userCard}>
                    <div className={styles.userCardHeader}>
                      <div className={styles.cellAvatarLarge}>
                        {f.type === 'bug' ? '🐛' : f.type === 'feature' ? '💡' : '⭐'}
                      </div>
                      <div className={styles.userCardInfo}>
                        <h4 className={styles.userCardName} style={{textTransform: 'capitalize'}}>{f.type}</h4>
                        <p className={styles.userCardEmail}>{new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={styles.userCardBody} style={{marginBottom: '10px'}}>
                      <p style={{fontSize: '0.9rem', color: '#4b5563', maxHeight: '100px', overflowY: 'auto'}}>{f.message}</p>
                      {f.rating && <p style={{color: '#f59e0b', marginTop: '5px', fontWeight: 'bold'}}>Rating: {f.rating}/5 ★</p>}
                    </div>
                    <div className={styles.userCardActions} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{
                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                        backgroundColor: f.status === 'SOLVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: f.status === 'SOLVED' ? 'var(--admin-success)' : 'var(--admin-accent)',
                        border: `1px solid ${f.status === 'SOLVED' ? 'var(--admin-success)' : 'var(--admin-accent)'}`,
                        textTransform: 'uppercase', letterSpacing: '1px'
                      }}>{f.status || 'INGESTING'}</span>
                      <div style={{display: 'flex', gap: '8px'}}>
                        {(f.status === 'PENDING' || !f.status) && (
                          <button onClick={() => handleUpdateFeedbackStatus(f.id, 'REVIEWED')} className={styles.cardActionBtn}>
                            <ChevronRight size={14} /> Review
                          </button>
                        )}
                        {f.status !== 'SOLVED' && (
                          <button onClick={() => handleUpdateFeedbackStatus(f.id, 'SOLVED')} className={`${styles.cardActionBtn} ${styles.btnSuccessText}`}>
                            <CheckCircle size={14} /> Solve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#6b7280'}}>No feedback submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Access Requests Tab */}
          {activeTab === 'access' && (
            <div className={`${styles.usersSection} ${styles.fadeIn}`}>
              <AdminAccessRequests user={user} />
            </div>
          )}

        </div>
      </main>

      {/* Password Reset Modal */}
      {showResetPassword && (
        <div className={styles.modalOverlay} style={{ background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div className={`${styles.modalContent} ${styles.fadeInUp}`} style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '1.5rem', padding: '2.5rem' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: 'white', fontWeight: 800 }}><Key size={20} color="var(--admin-accent)" /> Security Protocol Reset</h3>
              <button onClick={() => setShowResetPassword(false)} className={styles.closeModalBtn}>✕</button>
            </div>
            <p className={styles.modalText} style={{ color: 'var(--admin-text-muted)' }}>Overwriting credential matrix for selected node. This action is irreversible.</p>
            
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--admin-accent)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>New Security Key</label>
              <input
                type="password"
                placeholder="••••••••"
                value={resetPasswordData.newPassword}
                onChange={e => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                className={styles.formInput}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', color: 'white' }}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--admin-accent)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Verify Key</label>
              <input
                type="password"
                placeholder="••••••••"
                value={resetPasswordData.confirmPassword}
                onChange={e => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                className={styles.formInput}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', color: 'white' }}
              />
            </div>
            
            <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
              <button 
                onClick={handleResetPasswordSubmit}
                className={styles.actionBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Execute Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
