import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import AdminHeader from '../components/AdminHeader';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminUsers = () => {
  const navigate = useNavigate();
  const raw = localStorage.getItem('authUser');
  const user = raw ? JSON.parse(raw) : null;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/admin/users?userId=${user.id}`);
      console.log('[AdminUsers] Fetched users:', res.data);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('[AdminUsers] Error fetching users:', e);
      setError(e.response?.data?.error || e.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const promote = async (id) => {
    try {
      await axios.put(`${API}/api/admin/users/${id}/role?userId=${user.id}&role=ADMIN`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const removeUser = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/users/${id}?userId=${user.id}`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.adminWrapper}>
      <AdminHeader />
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Manage Users</h2>
        <p className={styles.subtitle}>View and manage registered users</p>
      </div>

      {error && (
        <div className={`${styles.card} ${styles.errorState}`} style={{ backgroundColor: '#fee', borderLeft: '4px solid red', padding: '12px' }}>
          <p style={{ color: 'red', margin: 0 }}>⚠️ {error}</p>
          <button onClick={fetchUsers} style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.card}>Loading...</div>
      ) : users.length === 0 ? (
        <div className={`${styles.card} ${styles.emptyState}`}>No users found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.trHeader}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className={styles.td}>{u.id}</td>
                  <td className={styles.td}>{u.fullName}</td>
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>{u.role}</td>
                  <td className={styles.td}>
                    {u.role !== 'ADMIN' && <button onClick={() => promote(u.id)} className={`${styles.actionBtn} ${styles.promoteBtn} mr-2`}>Promote</button>}
                    <button onClick={() => removeUser(u.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
