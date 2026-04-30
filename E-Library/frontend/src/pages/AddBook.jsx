import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import styles from './AddBook.module.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    totalPages: '',
    category: 'Fiction',
    isbn: '',
    publicationYear: new Date().getFullYear(),
    coverUrl: '',
    pdfUrl: '',
    content: '',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
    else setAuthUser(null);
  }, []);

  useEffect(() => {
    if (authUser && authUser.role !== 'ADMIN') {
      // non-admins should not be able to add books
      setError('Only administrators can add books.');
      setTimeout(() => navigate('/books'), 1200);
    }
  }, [authUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'totalPages' || name === 'publicationYear' ? parseInt(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.totalPages) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const raw = localStorage.getItem('authUser');
      const user = raw ? JSON.parse(raw) : null;
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: only admins can add books');
      }
      const response = await ActivityService.createBook(formData, user ? user.id : null);
      
      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/books');
        }, 2000);
      }
    } catch (err) {
      // If the server returned a helpful message, show it to the user
      console.warn('Error adding book:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('Failed to add book. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles['addbook-page']}>
      <div className={styles['addbook-container']}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/books')}
          className={styles['addbook-back-btn']}
        >
          <span>←</span> Back to Books
        </button>

        {/* Form Card */}
        <div className={styles['addbook-card']}>
          <h1 className={styles['addbook-title']}>📚 Add New Book</h1>
          <p className={styles['addbook-subtitle']}>Add a new book to your library</p>

          {success && (
            <div className={styles['addbook-success']}>
              ✓ Book added successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className={styles['addbook-error']}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['addbook-form']}>
            {/* Title and Author */}
            <div className={styles['addbook-row']}>
              <div>
                <label className={styles['addbook-label']}>
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., The Hobbit"
                  className={styles['addbook-input']}
                  required
                />
              </div>
              <div>
                <label className={styles['addbook-label']}>
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="e.g., J.R.R. Tolkien"
                  className={styles['addbook-input']}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={styles['addbook-label']}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a brief description of the book"
                rows="4"
                className={styles['addbook-input']}
              ></textarea>
            </div>

            {/* Pages and Category */}
            <div className={styles['addbook-row']}>
              <div>
                <label className={styles['addbook-label']}>
                  Total Pages *
                </label>
                <input
                  type="number"
                  name="totalPages"
                  value={formData.totalPages}
                  onChange={handleChange}
                  placeholder="e.g., 310"
                  className={styles['addbook-input']}
                  required
                />
              </div>
              <div>
                <label className={styles['addbook-label']}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles['addbook-input']}
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
              </div>
            </div>

            {/* ISBN and Publication Year */}
            <div className={styles['addbook-row']}>
              <div>
                <label className={styles['addbook-label']}>
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="e.g., 978-0547928227"
                  className={styles['addbook-input']}
                />
              </div>
              <div>
                <label className={styles['addbook-label']}>
                  Publication Year
                </label>
                <input
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  placeholder={new Date().getFullYear()}
                  className={styles['addbook-input']}
                />
              </div>
            </div>

            {/* Cover URL */}
            <div>
              <label className={styles['addbook-label']}>
                Cover URL
              </label>
              <input
                type="url"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleChange}
                placeholder="e.g., https://covers.openlibrary.org/.../cover.jpg"
                className={styles['addbook-input']}
              />
              {formData.coverUrl && (
                <div className={styles['addbook-preview-container']}>
                  <p className={styles['addbook-preview-label']}>Preview:</p>
                  <img
                    src={formData.coverUrl}
                    alt="Cover preview"
                    className={styles['addbook-preview-img']}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* PDF URL */}
            <div>
              <label className={styles['addbook-label']}>
                📄 PDF URL
              </label>
              <input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl}
                onChange={handleChange}
                placeholder="e.g., http://localhost:8080/files/Pride-and-Prejudice-Jane-Austen.txt"
                className={styles['addbook-input']}
              />
              <p className={styles['addbook-hint']}>
                Use our API: http://localhost:8080/files/[filename] or external PDF URLs
              </p>
            </div>

            {/* Emoji and Genre */}
            <div className={styles['addbook-row']}>
              <div>
                <label className={styles['addbook-label']}>
                  Book Emoji
                </label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  placeholder="e.g., 📚"
                  maxLength="2"
                  className={styles['addbook-input']}
                />
              </div>
              <div>
                <label className={styles['addbook-label']}>
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="e.g., Adventure"
                  className={styles['addbook-input']}
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className={styles['addbook-label']}>
                Book Content (Text)
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Paste the full book text content here (or leave empty if using PDF URL)"
                rows="6"
                className={styles['addbook-input']}
              ></textarea>
            </div>

            {/* Availability */}
            <div>
              <label className={styles['addbook-label']}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className={styles['addbook-checkbox']}
                />
                {' '}Book is Available
              </label>
            </div>

            {/* Buttons */}
            <div className={styles['addbook-btn-row']}>
              <button
                type="submit"
                disabled={loading}
                className={styles['addbook-btn-primary']}
              >
                {loading ? (
                  <>
                    <div className={styles['addbook-btn-spinner']}></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Add Book
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/books')}
                className={styles['addbook-btn-secondary']}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Required Fields Note */}
          <p className={styles['addbook-footer']}>
            <span className={styles['addbook-required']}>* Required fields:</span> Title, Author, and Total Pages
          </p>
        </div>
      </div>
    </main>
  );
};

export default AddBook;
