import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Highlighter,
  Volume2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Download,
  X,
  Eye,
  Loader,
  AlertCircle,
  Home,
  Clock,
} from 'lucide-react';
import { ActivityService } from '../services/ActivityService';
import styles from './Reading.module.css';
import ProgressBar from '../components/ProgressBar';

// PDF worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Reading.jsx - Professional E-Reader with Advanced Features
 * 
 * Features:
 * - Collapsible reading toolbar
 * - Bookmarks and highlighting
 * - Notes panel
 * - Reading settings (font size, dark mode)
 * - Progress tracking
 * - Smooth animations and transitions
 */
const Reading = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Core state
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [authUser, setAuthUser] = useState(null);

  // UI state
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Bookmarks and notes
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [highlights, setHighlights] = useState([]);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const timerRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        setAuthUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  // Initialize reading session
  useEffect(() => {
    if (authUser) {
      fetchData();
      loadBookmarks();
      loadNotes();
      startTimer();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bookId, authUser]);

  // Timer logic
  const startTimer = () => {
    setIsTiming(true);
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTiming(false);

    toast.success(
      `Reading session complete! ${Math.floor(elapsedTime / 60)} minutes read.`
    );
  };

  // Fetch book data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ActivityService.getBook(bookId);
      setBook(response.data);
      loadPDF(response.data.pdfUrl);
    } catch (err) {
      console.error('Error loading book:', err);
      toast.error('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  // Load PDF
  const loadPDF = async (pdfUrl) => {
    try {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      toast.error('Could not load PDF');
    }
  };

  // Render PDF page
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPDFPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoom, isDarkMode]);

  const renderPDFPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: zoom });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  // Bookmark management
  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter((p) => p !== currentPage));
      toast('Bookmark removed', { icon: '🔖' });
    } else {
      setBookmarks([...bookmarks, currentPage]);
      toast('Page bookmarked!', { icon: '📌' });
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem(`bookmarks_${bookId}`);
    if (saved) setBookmarks(JSON.parse(saved));
  };

  useEffect(() => {
    localStorage.setItem(`bookmarks_${bookId}`, JSON.stringify(bookmarks));
  }, [bookmarks, bookId]);

  // Notes management
  const addNote = () => {
    if (!currentNote.trim()) return;
    const newNote = {
      id: Date.now(),
      page: currentPage,
      text: currentNote,
      timestamp: new Date().toLocaleString(),
    };
    setNotes([...notes, newNote]);
    setCurrentNote('');
    toast.success('Note added!');
  };

  const loadNotes = () => {
    const saved = localStorage.getItem(`notes_${bookId}`);
    if (saved) setNotes(JSON.parse(saved));
  };

  useEffect(() => {
    localStorage.setItem(`notes_${bookId}`, JSON.stringify(notes));
  }, [notes, bookId]);

  // Auto-save progress
  useEffect(() => {
    if (book && currentPage > 0 && authUser) {
      const saveProgress = setTimeout(() => {
        ActivityService.updateProgress({
          userId: authUser.id,
          bookId: book.id,
          currentPage,
          totalPages,
        }).catch((err) => console.warn('Failed to save progress:', err));
      }, 2000);

      return () => clearTimeout(saveProgress);
    }
  }, [currentPage, book, authUser]);

  if (loading) {
    return (
      <div className={styles['reading-container']}>
        <div className={styles['reading-loading']}>
          <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book || !pdfDoc) {
    return (
      <div className={styles['reading-container']}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-screen"
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to load book
            </h2>
            <button
              onClick={() => navigate('/books')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Back to Books
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentPage);

  return (
    <div
      className={`${styles['reading-container']} ${isDarkMode ? 'dark' : ''}`}
      style={{
        backgroundColor: isDarkMode ? '#1a1a2e' : '#f8fafc',
      }}
    >
      {/* Top Toolbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={styles['reading-header']}
        style={{
          backgroundColor: isDarkMode ? '#0f3460' : '#ffffff',
          borderBottomColor: isDarkMode ? '#16213e' : '#e2e8f0',
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/books')}
            className={styles['reading-back-button']}
            style={{
              color: isDarkMode ? '#ffffff' : '#1e293b',
              borderColor: isDarkMode ? '#16213e' : '#e2e8f0',
              backgroundColor: isDarkMode ? '#16213e' : '#f1f5f9',
            }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          {/* Book Title */}
          <div className="flex-1 min-w-0">
            <h1
              className={styles['reading-title']}
              style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
            >
              {book.title}
            </h1>
            <p
              className={styles['reading-author']}
              style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
            >
              {book.author}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleBookmark}
              className={styles['reading-action-button']}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck size={18} filled />
              ) : (
                <Bookmark size={18} />
              )}
            </motion.button>

            {/* Notes */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotes(!showNotes)}
              className={styles['reading-action-button']}
              title="Notes"
            >
              <MessageSquare size={18} />
            </motion.button>

            {/* Dark Mode */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={styles['reading-action-button']}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className={styles['reading-action-button']}
            >
              <Settings size={18} />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar current={currentPage} total={totalPages} />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span
              style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <span
              style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
            >
              ⏱ {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
            </span>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4"
            style={{
              backgroundColor: isDarkMode ? '#16213e' : '#f1f5f9',
              borderBottom: `1px solid ${isDarkMode ? '#0f3460' : '#e2e8f0'}`,
            }}
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label
                  style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                  className="block text-sm font-bold mb-2"
                >
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                  className="block text-sm font-bold mb-2"
                >
                  Zoom Level
                </label>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 bg-indigo-600 text-white rounded-lg"
                  >
                    <ZoomOut size={18} />
                  </motion.button>
                  <span
                    style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                    className="font-semibold flex-1 text-center"
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-2 bg-indigo-600 text-white rounded-lg"
                  >
                    <ZoomIn size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={styles['reading-content-area']}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <canvas
            ref={canvasRef}
            className={styles['reading-pdf-canvas']}
            style={{
              filter: isDarkMode ? 'brightness(0.9)' : 'none',
            }}
          />
        </motion.div>
      </div>

      {/* Notes Panel */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl z-40 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">
                Notes & Highlights
              </h3>
              <button onClick={() => setShowNotes(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No notes yet. Add your first note below!
                </p>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-600 font-bold">
                        Page {note.page}
                      </span>
                      <button
                        onClick={() =>
                          setNotes(notes.filter((n) => n.id !== note.id))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-900">{note.text}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {note.timestamp}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Note Input */}
            <div className="p-4 border-t space-y-2">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNote}
                disabled={!currentNote.trim()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Add Note
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={styles['reading-footer']}
        style={{
          backgroundColor: isDarkMode ? '#0f3460' : '#ffffff',
          borderTopColor: isDarkMode ? '#16213e' : '#e2e8f0',
        }}
      >
        <div className={styles['reading-footer-row']}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={styles['reading-btn-prev']}
            style={{
              backgroundColor:
                currentPage === 1 ? '#cbd5e1' : '#4f46e5',
              color: 'white',
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </motion.button>

          <div className={styles['reading-footer-controls']}>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) =>
                setCurrentPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))
              }
              className={styles['reading-page-input']}
              style={{
                backgroundColor: isDarkMode ? '#16213e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#1e293b',
                borderColor: isDarkMode ? '#0f3460' : '#e2e8f0',
              }}
            />
            <span
              className={styles['reading-page-total-label']}
              style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
            >
              / {totalPages}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage >= totalPages}
            className={styles['reading-btn-next']}
            style={{
              backgroundColor:
                currentPage >= totalPages ? '#cbd5e1' : '#4f46e5',
              color: 'white',
            }}
          >
            Next
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Reading;
