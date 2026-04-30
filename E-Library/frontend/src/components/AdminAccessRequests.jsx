import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AdminAccessRequests.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminAccessRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING or ALL

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'PENDING' ? '/api/admin/access-requests' : '/api/admin/access-requests/all';
      const res = await axios.get(`${API}${endpoint}?userId=${user.id}`);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this request? Valid Admin Code will be emailed.')) {
      try {
        await axios.put(`${API}/api/admin/access-requests/${id}/approve?userId=${user.id}`);
        fetchRequests();
      } catch (err) {
        alert('Failed to approve request');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason !== null) {
      try {
        await axios.put(`${API}/api/admin/access-requests/${id}/reject?userId=${user.id}`, { adminNotes: reason });
        fetchRequests();
      } catch (err) {
        alert('Failed to reject request');
      }
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🔑 Admin Access Requests</h2>
        <div className={styles.filterBtns}>
          <button 
            className={filter === 'PENDING' ? styles.activeFilter : ''}
            onClick={() => setFilter('PENDING')}
          >
            Pending
          </button>
          <button 
            className={filter === 'ALL' ? styles.activeFilter : ''}
            onClick={() => setFilter('ALL')}
          >
            All History
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {requests.length === 0 ? (
          <p className={styles.noRequests}>No {filter.toLowerCase()} requests found.</p>
        ) : (
          requests.map(req => (
            <div key={req.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4>{req.userName}</h4>
                  <p>{req.userEmail}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[req.status.toLowerCase()]}`}>
                  {req.status}
                </span>
              </div>
              
              <div className={styles.detailsGrid}>
                <div className={styles.reasonBox}>
                  <strong>📝 Request Reason:</strong>
                  <p>{req.reason}</p>
                </div>

                {req.status === 'APPROVED' && (
                  <div className={styles.infoBox}>
                    <strong>✅ Admin Code Status:</strong>
                    <p>{req.adminCode ? `Code: ${req.adminCode}` : 'Code Pending'}</p>
                    <p style={{fontSize: '0.85rem', marginTop: '5px'}}>Status: {req.codeUsed ? '✓ Used' : '⏳ Not Used Yet'}</p>
                  </div>
                )}
              </div>

              {req.adminNotes && (
                <div className={styles.notesBox}>
                  <strong>📌 Admin Notes:</strong>
                  <p>{req.adminNotes}</p>
                </div>
              )}

              {req.status === 'PENDING' && (
                <div className={styles.actions}>
                  <button onClick={() => handleApprove(req.id)} className={styles.btnApprove}>Approve</button>
                  <button onClick={() => handleReject(req.id)} className={styles.btnReject}>Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAccessRequests;
