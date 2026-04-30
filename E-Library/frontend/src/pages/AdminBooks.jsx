import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import AdminHeader from '../components/AdminHeader';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminBooks = () => {
  const navigate = useNavigate();
  const raw = localStorage.getItem('authUser');
  const user = raw ? JSON.parse(raw) : null;
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/login'); return; }
    fetchBooks();
    // eslint-disable-next-line
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API}/api/books`);
      setBooks(res.data);
    } catch (e) { console.error(e); setBooks([]); }
  };

  const del = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/books/${id}?userId=${user.id}`);
      fetchBooks();
    } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.adminWrapper}>
      <AdminHeader />
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Manage Books</h2>
        <p className={styles.subtitle}>Add, remove or inspect books in the library</p>
      </div>

      <div className="mb-4"><Link to="/admin/books/add" className={styles.btnPrimary}>Add New Book</Link></div>

      {books.length === 0 ? (
        <div className={`${styles.card} ${styles.emptyState}`}>No books available.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.trHeader}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Author</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id}>
                  <td className={styles.td}>{b.id}</td>
                  <td className={styles.td}>{b.title}</td>
                  <td className={styles.td}>{b.author}</td>
                  <td className={styles.td}>{b.category}</td>
                  <td className={styles.td}>
                    <Link to={`/books/${b.id}`} className="mr-2">View</Link>
                    <button onClick={() => del(b.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Delete</button>
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

export default AdminBooks;
