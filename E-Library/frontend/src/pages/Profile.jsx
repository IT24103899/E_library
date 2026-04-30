import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Upload, Save, X, Camera } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      const parsedUser = JSON.parse(raw);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || '',
        email: parsedUser.email || '',
      });
      
      // Load saved profile photo
      const savedPhoto = localStorage.getItem('userProfilePhoto');
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result);
        setMessage({ type: 'info', text: 'Click "Save Changes" to upload your photo' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Save photo to localStorage
      if (previewPhoto) {
        localStorage.setItem('userProfilePhoto', previewPhoto);
        setProfilePhoto(previewPhoto);
        setPreviewPhoto(null);
      }

      // Update user data
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
      };
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({ type: 'success', text: '✓ Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: '✗ Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('userProfilePhoto');
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className={styles['profile-page']}>
      <div className={styles['profile-container']}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/activity')}
          className={styles['back-btn']}
        >
          ← Back to Dashboard
        </button>

        {/* Profile Header Card */}
        <div className={styles['profile-header']}>
          <div className={styles['photo-section']}>
            <div className={styles['photo-container']}>
              {profilePhoto || previewPhoto ? (
                <img 
                  src={previewPhoto || profilePhoto} 
                  alt="Profile" 
                  className={styles['profile-photo']}
                />
              ) : (
                <div className={styles['photo-placeholder']}>
                  <User size={60} />
                </div>
              )}
              {isEditing && (
                <label className={styles['photo-upload-overlay']}>
                  <Camera size={24} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div className={styles['user-role-badge']}>
              <Shield size={14} style={{ marginRight: '4px' }} />
              {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
            </div>
          </div>

          <div className={styles['header-info']}>
            <h1 className={styles['user-name']}>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={styles['edit-input']}
                  placeholder="Full Name"
                />
              ) : (
                formData.fullName || 'User'
              )}
            </h1>
            <p className={styles['user-email']}>
              <Mail size={16} style={{ marginRight: '8px' }} />
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles['edit-input']}
                  placeholder="Email"
                />
              ) : (
                formData.email || 'No email'
              )}
            </p>
          </div>

          <div className={styles['header-actions']}>
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className={styles['btn-save']}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewPhoto(null);
                  }}
                  className={styles['btn-cancel']}
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className={styles['btn-edit']}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`${styles['message']} ${styles[`message-${message.type}`]}`}>
            {message.text}
          </div>
        )}

        {/* Profile Details Cards */}
        <div className={styles['profile-details']}>
          
          {/* Account Information */}
          <div className={styles['detail-card']}>
            <div className={styles['card-header']}>
              <Shield size={20} />
              <h2>Account Information</h2>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['info-row']}>
                <label>Role</label>
                <span className={styles['info-badge']}>
                  {user.role === 'ADMIN' ? '👨‍💼 Administrator' : '👤 Member'}
                </span>
              </div>
              <div className={styles['info-row']}>
                <label>Account Status</label>
                <span className={styles['info-badge']}>
                  {user.isPremium ? '💎 Premium' : '⭐ Standard'}
                </span>
              </div>
              <div className={styles['info-row']}>
                <label>Email Verified</label>
                <span className={styles['info-badge']}>✓ Yes</span>
              </div>
            </div>
          </div>

          {/* Reading Statistics */}
          <div className={styles['detail-card']}>
            <div className={styles['card-header']}>
              <User size={20} />
              <h2>Quick Stats</h2>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['stat-box']}>
                <span className={styles['stat-label']}>Member Since</span>
                <span className={styles['stat-value']}>Apr 2026</span>
              </div>
              <div className={styles['stat-box']}>
                <span className={styles['stat-label']}>Account Type</span>
                <span className={styles['stat-value']}>{user.role === 'ADMIN' ? 'Admin' : 'User'}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`${styles['detail-card']} ${styles['danger-zone']}`}>
            <div className={styles['card-header']}>
              <LogOut size={20} />
              <h2>Account Actions</h2>
            </div>
            <div className={styles['card-content']}>
              <button 
                onClick={handleLogout}
                className={styles['btn-logout']}
              >
                <LogOut size={18} />
                Sign Out
              </button>
              <p className={styles['danger-text']}>You will be redirected to the login page.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
