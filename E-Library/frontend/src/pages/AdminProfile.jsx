import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminDashboard.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminProfile = () => {
  const navigate = useNavigate();
  const raw = localStorage.getItem('authUser');
  const user = raw ? JSON.parse(raw) : null;
  const mountedRef = useRef(true);

  // Verify admin role
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/admin-login');
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ fullName: '', email: '', role: 'USER' });

  // Books Management
  const [books, setBooks] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const booksRes = await axios.get(`${API}/api/books`);
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

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();
    fetchUsers();
    fetchBooks();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line
  }, []);

  // USER CRUD OPERATIONS
  const handleCreateUser = async () => {
    if (!userFormData.fullName || !userFormData.email) {
      setStatusMessage('Please fill all user fields');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/admin/users`, {
        ...userFormData,
        userId: user.id,
      });
      setUsers([...users, res.data]);
      setUserFormData({ fullName: '', email: '', role: 'USER' });
      setShowUserForm(false);
      setStatusMessage('User created successfully');
    } catch (e) {
      setStatusMessage('Failed to create user: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      const res = await axios.put(`${API}/api/admin/users/${userId}`, {
        ...userFormData,
        userId: user.id,
      });
      setUsers(users.map(u => u.id === userId ? res.data : u));
      setSelectedUser(null);
      setUserFormData({ fullName: '', email: '', role: 'USER' });
      setStatusMessage('User updated successfully');
    } catch (e) {
      setStatusMessage('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API}/api/admin/users/${userId}?userId=${user.id}`);
        setUsers(users.filter(u => u.id !== userId));
        setStatusMessage('User deleted successfully');
      } catch (e) {
        setStatusMessage('Failed to delete user');
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

  // BOOK CRUD OPERATIONS
  const handleCreateBook = async () => {
    if (!bookFormData.title || !bookFormData.author) {
      setStatusMessage('Please fill title and author');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/books`, {
        ...bookFormData,
        userId: user.id,
      });
      setBooks([...books, res.data]);
      setBookFormData({ title: '', author: '', description: '', isbn: '' });
      setShowBookForm(false);
      setStatusMessage('Book created successfully');
    } catch (e) {
      setStatusMessage('Failed to create book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API}/api/admin/books/${bookId}?userId=${user.id}`);
        setBooks(books.filter(b => b.id !== bookId));
        setStatusMessage('Book deleted successfully');
      } catch (e) {
        setStatusMessage('Failed to delete book');
      }
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

  return (
    <div className={styles.adminDashboard}>
      {/* Header */}
      <div className={styles.adminHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.adminTitle}>⚙️ Admin Control Panel</h1>
            <p className={styles.adminSubtitle}>Manage Users, Books & System</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.adminUser}>👤 {user?.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={styles.statusMessage}>
          {statusMessage}
          <button onClick={() => setStatusMessage('')} className={styles.closeStatus}>✕</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className={styles.tabsNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'books' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 Books
        </button>
      </div>

      {/* Content */}
      <div className={styles.adminContent}>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={styles.dashboardSection}>
            <h2 className={styles.sectionTitle}>System Overview</h2>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📚</div>
                <div className={styles.statLabel}>Total Books</div>
                <div className={styles.statValue}>{loading ? '...' : stats.totalBooks}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statLabel}>Total Users</div>
                <div className={styles.statValue}>{loading ? '...' : stats.totalUsers}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statLabel}>System Activity</div>
                <div className={styles.statValue}>{loading ? '...' : stats.totalActivity}</div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button onClick={() => setActiveTab('users')} className={styles.actionBtn}>
                  Manage Users
                </button>
                <button onClick={() => setActiveTab('books')} className={styles.actionBtn}>
                  Manage Books
                </button>
                <button onClick={() => { setShowUserForm(true); setActiveTab('users'); }} className={styles.actionBtn}>
                  Add User
                </button>
                <button onClick={() => { setShowBookForm(true); setActiveTab('books'); }} className={styles.actionBtn}>
                  Add Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={styles.usersSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>User Management</h2>
              <button 
                onClick={() => setShowUserForm(true)}
                className={styles.addBtn}
              >
                + Add New User
              </button>
            </div>

            {showUserForm && (
              <div className={styles.formCard}>
                <h3>Create New User</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={userFormData.fullName}
                  onChange={e => setUserFormData({...userFormData, fullName: e.target.value})}
                  className={styles.formInput}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userFormData.email}
                  onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                  className={styles.formInput}
                />
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                  className={styles.formInput}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className={styles.formButtons}>
                  <button onClick={handleCreateUser} className={styles.saveBtn}>Save</button>
                  <button onClick={() => setShowUserForm(false)} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          value={u.role}
                          onChange={e => handleChangeUserRole(u.id, e.target.value)}
                          className={styles.roleSelect}
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteUser(u.id)} className={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className={styles.booksSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Book Management</h2>
              <button 
                onClick={() => setShowBookForm(true)}
                className={styles.addBtn}
              >
                + Add New Book
              </button>
            </div>

            {showBookForm && (
              <div className={styles.formCard}>
                <h3>Add New Book</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={bookFormData.title}
                  onChange={e => setBookFormData({...bookFormData, title: e.target.value})}
                  className={styles.formInput}
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={bookFormData.author}
                  onChange={e => setBookFormData({...bookFormData, author: e.target.value})}
                  className={styles.formInput}
                />
                <input
                  type="text"
                  placeholder="ISBN"
                  value={bookFormData.isbn}
                  onChange={e => setBookFormData({...bookFormData, isbn: e.target.value})}
                  className={styles.formInput}
                />
                <textarea
                  placeholder="Description"
                  value={bookFormData.description}
                  onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                  className={styles.formTextarea}
                />
                <div className={styles.formButtons}>
                  <button onClick={handleCreateBook} className={styles.saveBtn}>Save</button>
                  <button onClick={() => setShowBookForm(false)} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.booksGrid}>
              {books.map(b => (
                <div key={b.id} className={styles.bookCard}>
                  <h4>{b.title}</h4>
                  <p><strong>Author:</strong> {b.author}</p>
                  <p><strong>ISBN:</strong> {b.isbn || 'N/A'}</p>
                  <p className={styles.description}>{b.description}</p>
                  <button 
                    onClick={() => handleDeleteBook(b.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProfile;
