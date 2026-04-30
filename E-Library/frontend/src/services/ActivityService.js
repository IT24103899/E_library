import axios from 'axios';
import { API_BASE_URL } from '../config/ApiConfig';

// API Base URL is now dynamically detected based on environment
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ActivityService = {
 
  getHistory: (userId) => {
    return apiClient.get(`/history?userId=${userId}`);
  },

  // READ - Get reading stats
  getStats: (userId) => {
    return apiClient.get(`/stats?userId=${userId}`);
  },

  // READ - Get reading progress for a book
  getProgress: (userId, bookId) => {
    return apiClient.get('/progress', {
      params: {
        userId: userId,
        bookId: bookId,
      },
    });
  },

  // CREATE - Add activity (borrow, start reading, etc.)
  createActivity: (activityData) => {
    return apiClient.post('/activity', activityData);
  },

  // CREATE/UPDATE - Log reading activity and update progress
  logActivity: (userId, action, bookId, progressData) => {
    return apiClient.put('/progress', null, {
      params: {
        userId: userId,
        bookId: bookId,
        currentPage: progressData.currentPage,
        totalPages: progressData.totalPages,
      },
    });
  },

  // UPDATE - Update reading progress
  updateProgress: (progressData) => {
    return apiClient.put('/progress', null, {
      params: {
        userId: progressData.userId,
        bookId: progressData.bookId,
        currentPage: progressData.currentPage,
        totalPages: progressData.totalPages,
      },
    });
  },

  // DELETE - Remove activity from history (soft delete)
  deleteActivity: (activityId) => {
    return apiClient.delete(`/history/${activityId}`);
  },

  // GET - Fetch all books
  getBooks: () => {
    return apiClient.get('/books');
  },

  // GET - Fetch single book details
  getBook: (bookId) => {
    return apiClient.get(`/books/${bookId}`);
  },

  // POST - Create new book
  createBook: (bookData, userId) => {
    // If userId provided, send as query param for server-side role check
    const url = userId ? `/books?userId=${userId}` : '/books';
    return apiClient.post(url, bookData);
  },

  // PUT - Update book details
  updateBook: (bookId, bookData) => {
    return apiClient.put(`/books/${bookId}`, bookData);
  },

  // DELETE - Delete a book
  deleteBook: (bookId) => {
    return apiClient.delete(`/books/${bookId}`);
  },
};

export default apiClient;
