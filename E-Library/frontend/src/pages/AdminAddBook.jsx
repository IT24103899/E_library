import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import AdminHeader from '../components/AdminHeader';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminAddBook = () => {
  const navigate = useNavigate();
  const raw = localStorage.getItem('authUser');
  const user = raw ? JSON.parse(raw) : null;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');

  if (!user || user.role !== 'ADMIN') {
    navigate('/login');
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, author, category };
      await axios.post(`${API}/api/admin/books?userId=${user.id}`, payload);
      navigate('/admin/books');
    } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.adminWrapper}>
      <AdminHeader />
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Add Book (Admin)</h2>
        <p className={styles.subtitle}>Create a new book entry</p>
      </div>

      <div className={styles.card} style={{maxWidth:640}}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block">Title</label>
            <input className="w-full p-2 border rounded" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block">Author</label>
            <input className="w-full p-2 border rounded" value={author} onChange={(e)=>setAuthor(e.target.value)} />
          </div>
          <div>
            <label className="block">Category</label>
            <input className="w-full p-2 border rounded" value={category} onChange={(e)=>setCategory(e.target.value)} />
          </div>
          <button type="submit" className={styles.btnPrimary}>Add Book</button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddBook;
