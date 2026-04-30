import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

/**
 * Toast notification component.
 * Props:
 *   message  : string
 *   type     : 'success' | 'error' | 'warning' | 'info'
 *   onClose  : () => void
 */
const Toast = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350); // wait for exit animation
    }, 4000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : ''}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={() => { setVisible(false); setTimeout(onClose, 350); }}>×</button>
    </div>
  );
};

/**
 * ToastContainer — renders all active toasts.
 * Usage: wrap your app or page with <ToastContainer toasts={toasts} onRemove={removeToast} />
 * Use the `useToast` hook to manage toasts.
 */
export const ToastContainer = ({ toasts, onRemove }) => (
  <div className={styles.container}>
    {toasts.map(t => (
      <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
    ))}
  </div>
);

/**
 * useToast hook — returns { toasts, showToast, removeToast }
 * showToast(message, type) — type: 'success' | 'error' | 'warning' | 'info'
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export default Toast;
