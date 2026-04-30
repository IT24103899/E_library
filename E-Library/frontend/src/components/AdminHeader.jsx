import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AdminHeader.module.css';

const AdminHeader = () => {
  const location = useLocation();
  const isActive = (p) => (location.pathname === p ? styles.active : '');

  return (
    <div className={styles.adminHeader}>
      <div className={styles.titleWrap}>
        <h2 className={styles.title}>Admin</h2>
        <p className={styles.subtitle}>Administration area — quick links</p>
      </div>

      <nav className={styles.nav}>
        <Link to="/admin" className={`${styles.link} ${isActive('/admin')}`}>Overview</Link>
        <Link to="/admin/activity" className={`${styles.link} ${isActive('/admin/activity')}`}>Activity</Link>
        <Link to="/admin/users" className={`${styles.link} ${isActive('/admin/users')}`}>Users</Link>
        <Link to="/admin/books" className={`${styles.link} ${isActive('/admin/books')}`}>Books</Link>
        <Link to="/admin/profile" className={`${styles.link} ${isActive('/admin/profile')}`}>👤 Profile</Link>
      </nav>
    </div>
  );
};

export default AdminHeader;
