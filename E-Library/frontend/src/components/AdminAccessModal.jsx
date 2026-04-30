import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminAccessModal.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminAccessModal = ({ user, onClose, onRoleUpdated }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentRequest();
  }, []);

  const fetchCurrentRequest = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/my-access-request?userId=${user.id}`);
      if (res.data && !res.data.hasRequest) {
        setRequest(null);
      } else {
        setRequest(res.data);
      }
    } catch (err) {
      setError('Failed to load request status.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!reason.trim()) {
       setError("Please enter a reason.");
       return;
    }
    setError('');
    setStatusMessage('');
    try {
      await axios.post(`${API}/api/admin/access-request?userId=${user.id}`, { reason });
      setStatusMessage("Request submitted successfully!");
      fetchCurrentRequest();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request.");
    }
  };

  const handleVerifyCode = async () => {
    if (!adminCode.trim()) {
      setError('Please enter the Admin Code.');
      return;
    }
    setError('');
    setStatusMessage('');
    try {
      await axios.post(`${API}/api/admin/verify-code?userId=${user.id}`, { adminCode });
      setStatusMessage("Success! You are now an Admin.");
      // notify parent to update user role
      setTimeout(() => {
         onRoleUpdated('ADMIN');
         onClose();
      }, 1500);
    } catch (err) {
       setError(err.response?.data?.error || "Invalid code or verification failed.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <div className={styles.modalHeader}>
          <div className={styles.iconContainer}>🔑</div>
          <h2>Admin Access</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.modalBody}>
             {error && <div className={styles.errorMessage}>{error}</div>}
             {statusMessage && <div className={styles.successMessage}>{statusMessage}</div>}

             {(!request || request.status === 'REJECTED') && (
               <div className={styles.requestSection}>
                 <p className={styles.infoText}>
                   Request Administrator privileges to manage users, books, and feedback. Please provide a genuine reason.
                 </p>
                 {request && request.status === 'REJECTED' && (
                    <div className={styles.rejectedPill}>Your previous request was rejected.</div>
                 )}
                 <textarea
                   className={styles.textArea}
                   placeholder="Why do you need admin access?"
                   value={reason}
                   onChange={e => setReason(e.target.value)}
                   rows={4}
                 />
                 <button className={styles.primaryButton} onClick={handleRequestAccess}>Submit Request</button>
               </div>
             )}

             {request && request.status === 'PENDING' && (
                <div className={styles.pendingSection}>
                  <div className={styles.pendingIcon}>⏳</div>
                  <h3>Request Pending</h3>
                  <p>Your request is currently under review by the administrators.</p>
                  <p className={styles.smallText}>Reason: {request.reason}</p>
                </div>
             )}

             {request && request.status === 'APPROVED' && !request.codeUsed && (
                <div className={styles.approvedSection}>
                  <div className={styles.approvedIcon}>✅</div>
                  <h3>Request Approved!</h3>
                  <p>Your request has been approved. An Admin Code has been sent to your email.</p>
                  
                  <div className={styles.codeVerificationBox}>
                    <input 
                      type="text" 
                      className={styles.codeInput}
                      placeholder="Enter Admin Code"
                      value={adminCode}
                      onChange={e => setAdminCode(e.target.value)}
                    />
                    <button className={styles.primaryButton} onClick={handleVerifyCode}>Verify Code</button>
                  </div>
                </div>
             )}

             {request && request.status === 'APPROVED' && request.codeUsed && (
                <div className={styles.approvedSection}>
                  <div className={styles.approvedIcon}>🎉</div>
                  <h3>You are an Admin.</h3>
                  <p>Your code has been verified.</p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccessModal;
