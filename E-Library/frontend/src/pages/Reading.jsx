import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import { ReaderService } from '../services/ReaderService';
import { getApiUrl } from '../config/ApiConfig';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Maximize, Minimize, ZoomOut, ZoomIn, Download,
  ChevronLeft, ChevronRight, Clock, Award, Bookmark as BookmarkIcon,
  Trash2, Plus, Type, Palette, Contrast, Layout, Menu, X, Highlighter
} from 'lucide-react';
import styles from './Reading.module.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const HIGHLIGHT_COLORS = [
  { name: 'yellow',  bg: 'rgba(253,224,71,0.45)',   border: '#f59e0b',  label: '🟡' },
  { name: 'green',   bg: 'rgba(74,222,128,0.45)',   border: '#22c55e',  label: '🟢' },
  { name: 'blue',    bg: 'rgba(96,165,250,0.45)',   border: '#3b82f6',  label: '🔵' },
  { name: 'pink',    bg: 'rgba(249,168,212,0.45)',  border: '#ec4899',  label: '🩷' },
  { name: 'orange',  bg: 'rgba(251,146,60,0.45)',   border: '#f97316',  label: '🟠' },
];

const getHighlightStyle = (color) => {
  const c = HIGHLIGHT_COLORS.find(h => h.name === color) || HIGHLIGHT_COLORS[0];
  return { bg: c.bg, border: c.border };
};

const Reading = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSavedPage, setLastSavedPage] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageContent, setPageContent] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [isTiming, setIsTiming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pagesReadDuringSession, setPagesReadDuringSession] = useState(0);
  const [authUser, setAuthUser] = useState(null);

  // ✅ AUTO-ADVANCE READING MODE
  const [autoAdvanceMode, setAutoAdvanceMode] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(60); // seconds per page (default 60s)
  const [countdownRemaining, setCountdownRemaining] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [pagesAdvanced, setPagesAdvanced] = useState(0);
  const autoAdvanceIntervalRef = useRef(null);

  // Reader Settings State
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('body-focus-mode');
    } else {
      document.body.classList.remove('body-focus-mode');
    }
    return () => document.body.classList.remove('body-focus-mode');
  }, [focusMode]);

  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [theme, setTheme] = useState('dark'); // 'dark', 'sepia', 'light'
  const [highContrast, setHighContrast] = useState(false);

  const [direction, setDirection] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Bookmarks and Highlights State
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // Text selection color picker popup
  const [selectionPopup, setSelectionPopup] = useState({ visible: false, x: 0, y: 0, text: '', highlightId: null });
  const selectionPopupRef = useRef(null);

  // Dismiss selection popup when clicking outside it
  useEffect(() => {
    const dismiss = (e) => {
      if (selectionPopupRef.current && !selectionPopupRef.current.contains(e.target)) {
        setSelectionPopup(prev => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);

  // New UI Management States
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const uiTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-hide UI in focus mode after 5 seconds of inactivity
    if (focusMode && isUiVisible && !leftDrawerOpen && !rightDrawerOpen) {
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
      uiTimeoutRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 5000);
    }
    return () => { if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current); };
  }, [focusMode, isUiVisible, leftDrawerOpen, rightDrawerOpen]);

  const toggleUi = (e) => {
    // If clicking on an interactive element, don't toggle
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;

    // Don't toggle if user just selected some text
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return;

    // If a drawer is open, close it instead of toggling UI
    if (leftDrawerOpen || rightDrawerOpen) {
      setLeftDrawerOpen(false);
      setRightDrawerOpen(false);
      return;
    }

    setIsUiVisible(!isUiVisible);
  };

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        setAuthUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        setAuthUser(null);
      }
    }
  }, []);

  const userId = authUser?.id || 1;
  const saveTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const countedPagesRef = useRef(new Set());
  const savingInProgressRef = useRef(false);
  const lastSentPageRef = useRef(0);
  const currentPageRef = useRef(1); // always tracks the latest currentPage for unmount saves
  const totalPagesRef = useRef(0);  // always tracks the latest totalPages for unmount saves
  const autoSaveIntervalRef = useRef(null);
  const WORDS_PER_PAGE = 250;

  const [stats, setStats] = useState(null);
  const sessionStartTimeRef = useRef(null);
  const pageTimeTrackingRef = useRef({}); // ✅ Track time spent on each page
  const lastPageCheckTimeRef = useRef(null); // ✅ For accurate timing

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setCurrentPage(p);
    }
    fetchData();
    fetchReaderData(); // Fetch marks

    // Automatically start reading session
    const startSession = () => {
      try {
        const sessRaw = sessionStorage.getItem('readingSession');
        if (sessRaw) {
          const sess = JSON.parse(sessRaw);
          if (sess && String(sess.bookId) === String(bookId)) {
            // Resume existing session
            const started = Number(sess.start || Date.now());
            const now = Date.now();
            sessionStartTimeRef.current = started;
            lastPageCheckTimeRef.current = now;
            setPagesReadDuringSession(Number(sess.pages || 0));
            setElapsed(Math.floor((now - started) / 1000));
            setIsTiming(true);
            // ✅ Use Date.now() for accurate timing, not counter increments
            sessionTimerRef.current = setInterval(() => {
              if (sessionStartTimeRef.current) {
                const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
                setElapsed(elapsed);
              }
            }, 500); // Update twice per second for smooth display
            return;
          }
        }
        // Start new session
        const now = Date.now();
        sessionStartTimeRef.current = now;
        lastPageCheckTimeRef.current = now;
        sessionStorage.setItem('readingSession', JSON.stringify({ bookId, start: now, pages: 0, pagesRead: [] }));
        setPagesReadDuringSession(0);
        setElapsed(0);
        setIsTiming(true);
        // ✅ Use Date.now() for accurate timing, not counter increments
        sessionTimerRef.current = setInterval(() => {
          if (sessionStartTimeRef.current) {
            const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
            setElapsed(elapsed);
          }
        }, 500); // Update twice per second for smooth display
        console.log('✅ Reading session started automatically');
      } catch (e) {
        console.error('Failed to start session:', e);
      }
    };
    startSession();

    // Cleanup when component unmounts
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [bookId, userId]);

  // Keep refs in sync with latest state so unmount can access current values
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  // Save progress when the user navigates away (component unmounts)
  useEffect(() => {
    return () => {
      const page = currentPageRef.current;
      const total = totalPagesRef.current;
      if (page > 0 && bookId && userId) {
        ActivityService.updateProgress({ userId, bookId, currentPage: page, totalPages: total || 1 })
          .catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard navigation: ESC to exit focus mode, Arrow keys for prev/next page
  useEffect(() => {
    const handleKeyboardNav = (event) => {
      // ESC to exit focus mode
      if (event.key === 'Escape' && focusMode) {
        setFocusMode(false);
        return;
      }

      // Arrow keys for navigation in focus mode
      if (focusMode) {
        if (event.key === 'ArrowLeft') {
          handlePrevPage();
          event.preventDefault();
        } else if (event.key === 'ArrowRight') {
          handleNextPage();
          event.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyboardNav);
    return () => window.removeEventListener('keydown', handleKeyboardNav);
  }, [focusMode, currentPage, totalPages]);

  // Auto-hide footer in focus mode with mouse movement detection
  const footerHideTimeoutRef = useRef(null);
  useEffect(() => {
    if (!focusMode) return;

    const handleMouseMove = () => {
      setFooterVisible(true);

      // Auto-hide after 3 seconds of inactivity
      if (footerHideTimeoutRef.current) {
        clearTimeout(footerHideTimeoutRef.current);
      }
      footerHideTimeoutRef.current = setTimeout(() => {
        setFooterVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Show footer initially
    setFooterVisible(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (footerHideTimeoutRef.current) {
        clearTimeout(footerHideTimeoutRef.current);
      }
    };
  }, [focusMode]);

  // ✅ Re-render PDF when window resizes to maintain "Big" layout
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && currentPage) {
        renderPDFPage(currentPage);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, currentPage, zoom]);

  const fetchReaderData = async () => {
    try {
      const bRes = await ReaderService.getBookmarks(userId, bookId);
      const hRes = await ReaderService.getHighlights(userId, bookId);
      setBookmarks(bRes.data || []);
      setHighlights(hRes.data || []);
    } catch (err) {
      console.warn("Could not fetch bookmarks or highlights", err);
    }
  };

  // Render PDF page when currentPage changes
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      const canvas = canvasRef.current;
      // Only render if the currently attached canvas actually belongs to the active page
      if (canvas && canvas.getAttribute('data-page') === String(currentPage)) {
        renderPDFPage(currentPage);
      }
    } else if (!pdfDoc && fullContent) {
      updateTextPage(currentPage);
    }
  }, [pdfDoc, currentPage, fullContent, zoom, focusMode]);

  // Apply visual highlights to PDF text layer
  useEffect(() => {
    if (!pdfDoc || !textLayerRef.current) return;

    const pageHighlights = highlights.filter(h => h.pageNumber === currentPage);
    // Only process actual span elements (renderTextLayer may also insert <br> and <div> nodes)
    const spans = Array.from(textLayerRef.current.querySelectorAll('span, div'));

    // Reset previous highlights and click handlers
    spans.forEach(span => {
      span.style.backgroundColor = 'transparent';
      span.style.borderBottom = 'none';
      span.style.borderRadius = '0';
      span.style.cursor = '';
      span.removeAttribute('data-highlight-id');
      if (span._hlClickHandler) {
        span.removeEventListener('click', span._hlClickHandler);
        delete span._hlClickHandler;
      }
    });

    if (pageHighlights.length === 0) return;

    let cleanFullText = "";
    const spanMappings = spans.map(span => {
      const cleanText = (span.textContent || "").replace(/\s+/g, '');
      const start = cleanFullText.length;
      cleanFullText += cleanText;
      return { span, start, end: cleanFullText.length };
    });

    pageHighlights.forEach(hl => {
      if (!hl.content) return;
      const cleanHl = hl.content.replace(/\s+/g, '');
      if (cleanHl.length < 2) return;
      const { bg, border } = getHighlightStyle(hl.color);

      let startIndex = cleanFullText.indexOf(cleanHl);
      while (startIndex !== -1) {
        const endIndex = startIndex + cleanHl.length;

        spanMappings.forEach(mapping => {
          if (mapping.start < endIndex && mapping.end > startIndex) {
            mapping.span.style.backgroundColor = bg;
            mapping.span.style.borderBottom = `2px solid ${border}`;
            mapping.span.style.borderRadius = '2px';
            mapping.span.style.cursor = 'pointer';
            mapping.span.setAttribute('data-highlight-id', hl.id);
            mapping.span.title = 'Click to remove highlight';
            // Attach click handler (once per span per highlight)
            if (!mapping.span._hlClickHandler) {
              mapping.span._hlClickHandler = (e) => {
                e.stopPropagation();
                const hid = mapping.span.getAttribute('data-highlight-id');
                if (hid) handleDeleteHighlight(Number(hid));
              };
              mapping.span.addEventListener('click', mapping.span._hlClickHandler);
            }
          }
        });

        startIndex = cleanFullText.indexOf(cleanHl, startIndex + 1);
      }
    });
  }, [pdfDoc, currentPage, highlights, pageContent, zoom, focusMode]);

  useEffect(() => {
    console.log(`[AutoSave Trigger] page=${currentPage} lastSaved=${lastSavedPage} book=${!!book}`);
    if (currentPage !== lastSavedPage && book && currentPage > 0) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        console.log(`[AutoSave Timer] firing page=${currentPage} inProgress=${savingInProgressRef.current} lastSent=${lastSentPageRef.current}`);
        if (!savingInProgressRef.current && currentPage !== lastSentPageRef.current) {
          handleAutoSave();
        }
      }, 2000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [currentPage, book]);

  // ✅ IMPROVED: Count pages based on time spent + page changes
  useEffect(() => {
    if (!isTiming || !book) return;

    const currentTime = Date.now();
    const pageKey = String(currentPage);

    // Initialize tracking for this page if not exists
    if (!pageTimeTrackingRef.current[pageKey]) {
      pageTimeTrackingRef.current[pageKey] = { firstSeen: currentTime, lastSeen: currentTime, counted: false };
    } else {
      pageTimeTrackingRef.current[pageKey].lastSeen = currentTime;
    }

    // Check if we should count this page as "read" (3+ seconds on page)
    const pageData = pageTimeTrackingRef.current[pageKey];
    const timeOnPage = (currentTime - pageData.firstSeen) / 1000; // seconds

    if (timeOnPage >= 3 && !pageData.counted) {
      pageData.counted = true;
      setPagesReadDuringSession(prev => {
        const newCount = prev + 1;
        console.log(`✅ Page ${currentPage} counted! (${timeOnPage.toFixed(1)}s on page) Total: ${newCount} pages`);

        // Update sessionStorage with accurate page count
        try {
          const sessRaw = sessionStorage.getItem('readingSession');
          if (sessRaw) {
            const sess = JSON.parse(sessRaw);
            sess.pages = newCount;
            sess.pagesRead = sess.pagesRead || [];
            if (!sess.pagesRead.includes(currentPage)) {
              sess.pagesRead.push(currentPage);
            }
            sess.lastUpdated = Date.now();
            sessionStorage.setItem('readingSession', JSON.stringify(sess));
          }
        } catch (e) {
          console.warn('Could not update sessionStorage:', e);
        }

        return newCount;
      });
    }
  }, [currentPage, isTiming, book, elapsed]);

  // ✅ AUTO-ADVANCE READING MODE: Countdown timer and automatic page advance
  useEffect(() => {
    if (!autoAdvanceMode || !isTiming || isPaused) {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
      return;
    }

    // Reset countdown when page changes (automatic OR manual)
    setCountdownRemaining(selectedSpeed);

    // Start countdown
    autoAdvanceIntervalRef.current = setInterval(() => {
      setCountdownRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next page
          setCurrentPage(currentPageVal => {
            if (currentPageVal < totalPages) {
              setPagesAdvanced(pa => pa + 1);
              console.log(`⏰ Auto-advanced to page ${currentPageVal + 1} (speed: ${selectedSpeed}s)`);
              return currentPageVal + 1;
            }
            return currentPageVal;
          });
          return selectedSpeed; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
    };
  }, [autoAdvanceMode, isTiming, isPaused, selectedSpeed, totalPages, currentPage]);

  // Auto-save session to database every 5 minutes (prevent data loss)
  useEffect(() => {
    if (!isTiming) return;

    // Auto-save function - ✅ Use actual elapsed time
    const autoSaveSessionToDatabase = async () => {
      const actualElapsed = sessionStartTimeRef.current ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000) : elapsed;

      // Use pagesAdvanced if in auto-advance mode, otherwise use pagesReadDuringSession
      const pagesToLog = autoAdvanceMode ? pagesAdvanced : pagesReadDuringSession;
      if (pagesToLog === 0 && actualElapsed < 60) return; // Skip if minimal reading

      try {
        const durationSeconds = Math.max(60, actualElapsed);
        const mlUrl = getApiUrl().replace(':8080', ':5000');
        const response = await fetch(`${mlUrl}/velocity/log-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: Number(userId),
            bookId: Number(bookId),
            pagesRead: Number(pagesToLog),
            durationSeconds: Number(durationSeconds),
            sessionDate: new Date().toISOString().split('T')[0],
            isAutoSave: true,
            mode: autoAdvanceMode ? 'auto-advance' : 'manual'
          })
        });

        if (response.ok) {
          // Update sessionStorage with last auto-save timestamp
          const sessRaw = sessionStorage.getItem('readingSession');
          if (sessRaw) {
            const sess = JSON.parse(sessRaw);
            sess.lastAutoSave = Date.now();
            sessionStorage.setItem('readingSession', JSON.stringify(sess));
          }
          console.log(`✅ Auto-saved: ${pagesToLog} pages in ${Math.round(actualElapsed / 60)}m`);
        }
      } catch (err) {
        console.warn('[Auto-Save] Session not auto-saved (Flask may be down):', err.message);
      }
    };

    // Set up 5-minute auto-save interval
    autoSaveIntervalRef.current = setInterval(autoSaveSessionToDatabase, 300000); // 5 minutes = 300000ms

    // Cleanup interval on unmount or when session ends
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [isTiming, pagesReadDuringSession, pagesAdvanced, elapsed, userId, bookId, autoAdvanceMode]);

  // Apply body classes for global theme/contrast over text
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const loadPDF = async (pdfUrl) => {
    try {
      let source = pdfUrl;
      const pdf = await pdfjsLib.getDocument(source).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage((prev) => (prev && prev > 1 ? prev : 1));
    } catch (err) {
      setError('Could not load PDF. Trying fallback text content...');
    }
  };

  const renderPDFPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // ✅ Reset rotation metadata correctly
      const pageRotate = page.rotate || 0;
      const unscaledViewport = page.getViewport({ scale: 1, rotation: pageRotate });
      
      const container = canvas.parentElement;
      const pdfWrapper = container.parentElement;
      
      // ✅ ADJUST: Use 95% width on mobile, 70% on desktop
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 1024;
      const availableWidth = isMobile ? screenWidth * 0.95 : screenWidth * 0.70; 
      
      // ✅ baseScale: Map PDF 100% (zoom=1.0) to 70% container width
      // Cap at 1.8 to prevent small-source PDFs from looking blurry
      const baseScale = Math.min(1.8, availableWidth / unscaledViewport.width);
      const scale = Math.max(0.5, Math.min(4, baseScale * zoom));
      
      const viewport = page.getViewport({ scale, rotation: pageRotate });

      const outputScale = window.devicePixelRatio || 1.1; // Slight over-scale for crispness

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      // ✅ Force container dimensions immediately to prevent squishing
      if (container) {
        container.style.width = `${Math.floor(viewport.width)}px`;
        container.style.height = `${Math.floor(viewport.height)}px`;
        container.style.maxWidth = '100vw'; // Allow full-room expansion
        container.style.boxShadow = '0 30px 90px rgba(0,0,0,0.6)';
        container.style.margin = '20px auto';
      }

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }

      // Extract and render text layer
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');

      // Use PDF.js renderTextLayer for pixel-accurate selectable text spans
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        textLayerRef.current.style.position = 'absolute';
        textLayerRef.current.style.top = '0px';
        textLayerRef.current.style.left = '0px';
        textLayerRef.current.style.width = viewport.width + 'px';
        textLayerRef.current.style.height = viewport.height + 'px';
        textLayerRef.current.style.zIndex = '10';
        textLayerRef.current.style.pointerEvents = 'auto';
        textLayerRef.current.style.userSelect = 'text';
        textLayerRef.current.style.cursor = 'text';
        textLayerRef.current.style.overflow = 'visible';

        try {
          const renderTask = pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerRef.current,
            viewport: viewport,
            textDivs: [],
            enhanceTextSelection: true,
          });
          await renderTask.promise;
        } catch (e) {
          // Fallback: manual positioning if renderTextLayer unavailable
          textContent.items.forEach((item) => {
            const span = document.createElement('span');
            const itemViewport = page.getViewport({ scale, rotation: pageRotate });
            const [tx, ty] = pdfjsLib.Util.transform(
              pdfjsLib.Util.transform(itemViewport.transform, item.transform),
              [0, 0]
            );
            span.style.position = 'absolute';
            span.style.left = tx + 'px';
            span.style.top = (ty - (item.height * scale)) + 'px';
            span.style.fontSize = (item.height * scale) + 'px';
            span.style.fontFamily = 'inherit';
            span.style.color = 'transparent';
            span.style.whiteSpace = 'pre';
            span.textContent = item.str;
            textLayerRef.current.appendChild(span);
          });
        }
      }
      // Set page content AFTER text layer is populated so highlight effect fires at the right time
      setPageContent(text);
    } catch (err) {
      console.error('Render error:', err);
      setPageContent('Error rendering page content');
    }
  };

  const updateTextPage = (pageNum) => {
    if (!fullContent) return;
    if (pageNum === 1) {
      setPageContent(fullContent);
      return;
    }
    const words = fullContent.split(/\s+/).filter(word => word.length > 0);
    const startIndex = (pageNum - 1) * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, words.length);
    if (startIndex >= words.length) {
      setPageContent('');
      return;
    }
    setPageContent(words.slice(startIndex, endIndex).join(' '));
    setTotalPages(Math.ceil(words.length / WORDS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
    }
  };

  const handleAutoSave = async () => {
    console.log(`[handleAutoSave] called: userId=${userId} bookId=${bookId} page=${currentPage}/${totalPages} lastSaved=${lastSavedPage} book=${!!book}`);
    if (savingInProgressRef.current || !book || currentPage === lastSavedPage) {
      console.log(`[handleAutoSave] early return: inProgress=${savingInProgressRef.current} noBook=${!book} samePage=${currentPage === lastSavedPage}`);
      return;
    }
    savingInProgressRef.current = true;
    setSaving(true);
    try {
      console.log(`[handleAutoSave] calling API: userId=${userId} bookId=${bookId} currentPage=${currentPage} totalPages=${totalPages}`);
      await ActivityService.logActivity(userId, 'READ', bookId, {
        progress: Math.round((currentPage / totalPages) * 100),
        currentPage: currentPage,
        totalPages: totalPages
      });
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
      console.log(`[handleAutoSave] saved page ${currentPage} successfully`);
    } catch (err) {
      console.error(`[handleAutoSave] ERROR:`, err.message);
    } finally {
      savingInProgressRef.current = false;
      setSaving(false);
    }
  };

  const stopSession = async () => {
    // ✅ CRITICAL: Stop timer first and ensure it doesn't restart
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // ✅ CRITICAL: Stop auto-advance interval
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
      autoAdvanceIntervalRef.current = null;
    }

    // ✅ CRITICAL: Stop auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }

    // ✅ Use actual elapsed time calculated from session start, not state variable
    const actualElapsed = sessionStartTimeRef.current ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000) : elapsed;

    // ✅ Stop timing before async operations
    setIsTiming(false);
    setAutoAdvanceMode(false);

    try {
      const savedPage = Math.min(Number(currentPage || 1), totalPages || Number.MAX_SAFE_INTEGER);

      // Use pagesAdvanced if in auto-advance mode, otherwise pagesReadDuringSession
      const pagesToLog = autoAdvanceMode ? pagesAdvanced : pagesReadDuringSession;

      console.log(`[StopSession] 📊 Session Summary:`);
      console.log(`  - Final page: ${savedPage}/${totalPages}`);
      console.log(`  - Pages logged: ${pagesToLog}`);
      console.log(`  - Actual elapsed: ${actualElapsed}s (${(actualElapsed / 60).toFixed(1)} min)`);
      console.log(`  - Mode: ${autoAdvanceMode ? 'AUTO-ADVANCE' : 'MANUAL'} (${selectedSpeed}s/page)`);

      await ActivityService.updateProgress({ userId, bookId, currentPage: savedPage, totalPages });

      // Log session for velocity tracking to Spring Boot
      const minutes = Math.max(1, Math.floor(actualElapsed / 60));
      await ActivityService.logActivity(userId, 'SESSION', bookId, {
        currentPage: pagesToLog,
        timeSpentMinutes: minutes
      });

      // Also log to Python velocity API for analytics
      if (pagesToLog > 0 && actualElapsed > 0) {
        try {
          const durationSeconds = Math.max(60, actualElapsed);
          const mlUrl = getApiUrl().replace(':8080', ':5000');
          const response = await fetch(`${mlUrl}/velocity/log-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: Number(userId),
              bookId: Number(bookId),
              pagesRead: Number(pagesToLog),
              durationSeconds: Number(durationSeconds),
              sessionDate: new Date().toISOString().split('T')[0],
              mode: autoAdvanceMode ? 'auto-advance' : 'manual',
              speedPerPage: autoAdvanceMode ? selectedSpeed : null
            })
          });
          if (response.ok) {
            console.log('✅ Session logged to velocity API');
          }
        } catch (velocityErr) {
          console.warn('[Velocity API] Session not logged (expected if Flask not running):', velocityErr.message);
        }
      }

      try { sessionStorage.removeItem('readingSession'); } catch (e) { }

      // ✅ DISPATCH EVENT TO REFRESH STATS ON DASHBOARD
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { bookId, currentPage: savedPage, velocityUpdated: true } }));
      console.log('[StopSession] ✅ Session stopped and event dispatched');
    } catch (err) {
      console.error('[StopSession] Error:', err);
    } finally {
      setPagesReadDuringSession(0);
      setPagesAdvanced(0);
      countedPagesRef.current.clear();
      pageTimeTrackingRef.current = {}; // ✅ Clear page tracking
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ActivityService.getBook(bookId);
      const currentBook = response.data;
      setBook(currentBook);

      try {
        const statsResponse = await ActivityService.getStats(userId);
        setStats(statsResponse.data);
      } catch (err) {
        console.warn("Could not fetch user stats", err);
        setStats({ readingVelocity: 0 });
      }

      if (currentBook.pdfUrl) {
        await loadPDF(currentBook.pdfUrl);
      } else if (currentBook.content) {
        setFullContent(currentBook.content);
      } else {
        setError('No readable content available for this book.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load book data');
    } finally {
      setLoading(false);
    }
  };

  // --- Bookmark and Highlight Actions ---
  const handleAddBookmark = async () => {
    try {
      // Check if bookmark already exists for current page
      const bookmarkExists = bookmarks.some(b => b.pageNumber === currentPage);

      if (bookmarkExists) {
        alert(`Page ${currentPage} is already bookmarked!`);
        return;
      }

      const res = await ReaderService.addBookmark({
        userId,
        bookId: Number(bookId) || bookId,
        pageNumber: Number(currentPage)
      });
      if (res.data) {
        setBookmarks([...bookmarks, res.data]);
        alert(`Bookmark added for page ${currentPage}!`);
      }
    } catch (err) {
      console.error('Failed to add bookmark', err);
      alert('Failed to save bookmark. Did you restart the Spring Boot backend?');
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await ReaderService.deleteBookmark(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bookmark', err);
    }
  };

  // Check if current page is already bookmarked
  const isPageBookmarked = bookmarks.some(b => b.pageNumber === currentPage);

  const handleDeleteHighlight = async (id) => {
    try {
      await ReaderService.deleteHighlight(id);
      setHighlights(highlights.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to delete highlight', err);
    }
  };

  // Show color picker popup on text selection
  const handleTextSelection = (e) => {
    // Don't trigger on right-click or inside the popup itself
    if (e.button === 2) return;
    if (selectionPopupRef.current && selectionPopupRef.current.contains(e.target)) return;
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length > 2) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        // Check if the selected text matches an existing highlight on this page
        const pageHighlights = highlights.filter(h => h.pageNumber === currentPage);
        const matchedHL = pageHighlights.find(h => h.content && h.content.includes(text));
        setSelectionPopup({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          text,
          highlightId: matchedHL ? matchedHL.id : null,
        });
      } else {
        setSelectionPopup(prev => ({ ...prev, visible: false }));
      }
    }, 10);
  };

  const handleAddHighlight = async (color = 'yellow', selectedText = null) => {
    const textToHighlight = selectedText || selectionPopup.text || window.getSelection().toString().trim();
    if (!textToHighlight) {
      alert('Please select text first before highlighting!');
      return;
    }
    setSelectionPopup(prev => ({ ...prev, visible: false }));
    window.getSelection().removeAllRanges();
    try {
      const res = await ReaderService.addHighlight({
        userId,
        bookId: Number(bookId) || bookId,
        pageNumber: Number(currentPage),
        content: textToHighlight,
        color,
      });
      if (res.data) {
        setHighlights(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to add highlight', err);
    }
  };

  const isCompleted = currentPage >= totalPages;
  const themeClass = theme === 'light' ? styles['theme-light'] : theme === 'sepia' ? styles['theme-sepia'] : '';

  const renderTextWithHighlights = (text, pageHighlights) => {
    if (!text) return null;
    if (!pageHighlights || pageHighlights.length === 0) return text;

    let parts = [{ text, isHighlight: false }];

    pageHighlights.forEach(hl => {
      if (!hl.content) return;
      const newParts = [];
      parts.forEach(part => {
        if (part.isHighlight) {
          newParts.push(part);
          return;
        }
        const splitText = part.text.split(hl.content);
        splitText.forEach((segment, index) => {
          newParts.push({ text: segment, isHighlight: false });
          if (index < splitText.length - 1) {
            newParts.push({ text: hl.content, isHighlight: true, id: hl.id });
          }
        });
      });
      parts = newParts.filter(p => p.text.length > 0);
    });

    return parts.map((part, index) => {
      if (part.isHighlight) {
        const { bg, border } = getHighlightStyle(
          pageHighlights.find(h => h.id === part.id)?.color
        );
        return (
          <span
            key={index}
            style={{ backgroundColor: bg, borderBottom: `2px solid ${border}`, borderRadius: '2px', padding: '0 1px', cursor: 'pointer' }}
            title="Click to remove highlight"
            onClick={() => handleDeleteHighlight(part.id)}
          >
            {part.text}
          </span>
        );
      }
      return <span key={index}>{part.text}</span>;
    });
  };

  const renderMainContent = () => (
    <div className={focusMode ? styles['focus-content-wrapper'] : styles['reading-text-wrapper']}>
      {pdfDoc ? (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, rotateY: direction === 1 ? 45 : -45, x: direction === 1 ? 100 : -100 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: direction === 1 ? -45 : 45, x: direction === 1 ? -100 : 100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={styles['reading-pdf-container']}
            style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
          >
            <canvas
              data-page={currentPage}
              ref={(node) => {
                if (node && node !== canvasRef.current) {
                  canvasRef.current = node;
                  setTimeout(() => { if (pdfDoc) renderPDFPage(currentPage); }, 10);
                }
              }}
              className={styles['reading-pdf-canvas']}
              style={{ filter: `brightness(${brightness}%) ${highContrast ? 'contrast(120%) saturate(150%)' : ''}` }}
            />
            <div ref={textLayerRef} className={styles['reading-text-layer']} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, x: direction === 1 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 1 ? -50 : 50 }}
            transition={{ duration: 0.4 }}
            className={styles['reading-text-container']}
            style={{ filter: `brightness(${brightness}%)` }}
          >
            {!focusMode && currentPage === 1 && (
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{book?.title}</h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.7 }}>{book?.author}</p>
                <div style={{ width: '60px', height: '4px', background: 'var(--accent-gold)', margin: '2rem auto' }} />
              </div>
            )}
            <div className={styles['reading-page-content']}>
              {renderTextWithHighlights(pageContent, highlights.filter(h => h.pageNumber === currentPage))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={styles['reading-container']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          style={{ fontSize: '3rem', marginBottom: '1rem' }}
        >
          📖
        </motion.div>
        <p>Gathering your wisdom...</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles['reading-container']} ${!isUiVisible ? styles['ui-hidden'] : ''}`}
      data-theme={theme}
      onMouseMove={() => {
        if (!isUiVisible) setIsUiVisible(true);
      }}
      onMouseUp={handleTextSelection}
    >

      {/* Content Layer (Standard Mode) */}
      {!focusMode ? (
        <main className={styles['content-layer']} onClick={toggleUi}>
          {error ? (
            <div className={styles['reading-error']}>{error}</div>
          ) : (
            renderMainContent()
          )}
        </main>
      ) : (
        /* Immersive Focus Mode Overlay */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles['focus-overlay']}
        >
          {renderMainContent()}
          
          {/* Floating Focus Controls */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={styles['focus-controls']}
          >
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className={styles['focus-btn']}
            >
              <ChevronLeft size={20} />
              <span>Prev</span>
            </button>
            
            <div className={styles['focus-page-indicator']}>
              PAGE {currentPage} / {totalPages}
            </div>

            <button 
              onClick={handleNextPage} 
              disabled={isCompleted}
              className={styles['focus-btn']}
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

            <button 
              onClick={() => setFocusMode(false)}
              className={styles['focus-exit-btn']}
            >
              <Minimize size={18} />
              <span>Exit Focus</span>
            </button>
          </motion.div>
        </motion.div>
      )}


      {/* Primary UI Elements (Always Visible, Hidden in Focus Mode) */}
      {!focusMode && (
        <header className={`${styles['reading-header']} ${!isUiVisible ? styles['ui-hidden-direct'] : ''}`}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className={styles['btn-icon']}
              title="Return to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className={styles['header-book-info']}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{book?.title}</h2>
              <p className={styles['hideOnMobile']} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{book?.author}</p>
            </div>
          </div>

          {/* Quick Access Accessibility Controls */}
          <div className={styles['accessibility-toolbar']}>
            <div className={styles['toolbar-group']}>
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className={styles['tool-btn']} title="Zoom Out"><ZoomOut size={16} /></button>
              <span className={styles['tool-value']}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className={styles['tool-btn']} title="Zoom In"><ZoomIn size={16} /></button>
            </div>

            <div className={styles['toolbar-divider']} />

            <div className={styles['toolbar-group']} style={{ gap: '0.75rem' }}>
              <Layout size={16} color="var(--text-muted)" />
              <input
                type="range" min="30" max="150" value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className={styles['mini-slider']}
              />
              <span className={styles['tool-value']}>{brightness}%</span>
            </div>

            <div className={styles['toolbar-divider']} />

            <div className={styles['toolbar-group']}>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`${styles['tool-btn']} ${highContrast ? styles['active'] : ''}`}
                title="High Contrast"
              >
                <Contrast size={16} />
              </button>
              <div className={styles['auto-advance-group']} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  onClick={() => setAutoAdvanceMode(!autoAdvanceMode)}
                  className={`${styles['tool-btn']} ${autoAdvanceMode ? styles['active'] : ''}`}
                  title="Toggle Auto-Advance"
                >
                  <Clock size={16} />
                </button>

                {autoAdvanceMode && (
                  <div className={styles['auto-advance-controls']}>
                    <div className={styles['toolbar-divider']} style={{ margin: '0 0.5rem' }} />

                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={styles['tool-btn']}
                      title={isPaused ? "Resume Timer" : "Pause Timer"}
                    >
                      {isPaused ? <Plus size={14} /> : <Minimize size={14} />}
                    </button>

                    <div className={styles['countdown-badge']}>
                      {isPaused ? 'PAUSED' : `${countdownRemaining}s`}
                    </div>

                    <div className={styles['speed-controls']}>
                      <button onClick={() => setSelectedSpeed(s => Math.max(5, s - 5))} className={styles['tool-btn-mini']}>-5</button>
                      <span className={styles['tool-value-mini']}>{selectedSpeed}s</span>
                      <button onClick={() => setSelectedSpeed(s => s + 5)} className={styles['tool-btn-mini']}>+5</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setFocusMode(true)}
              className={styles['btn-pill']}
              title="Enter Focus Mode"
            >
              <Maximize size={18} />
              <span className={styles['pill-text']}>Focus</span>
            </button>
            <button
              onClick={() => setLeftDrawerOpen(true)}
              className={styles['btn-pill']}
            >
              <Highlighter size={18} />
              <span className={styles['pill-text']}>Library</span>
            </button>
            <button
              onClick={() => setRightDrawerOpen(true)}
              className={styles['btn-pill']}
            >
              <Menu size={18} />
              <span className={styles['pill-text']}>Settings</span>
            </button>
            <button
              onClick={() => stopSession().then(() => navigate('/dashboard'))}
              className={`${styles['btn-pill']} ${styles['btn-accent']}`}
              style={{ fontWeight: 800 }}
            >
              🛑 EXIT
            </button>
          </div>
        </header>
      )}

      {/* Floating Stat Badges */}
      {!focusMode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${styles['floating-badge']} ${styles['hideOnMobile']}`}
        >
          <span className={styles['badge-label']}>Session Progress</span>
          <span className={styles['badge-value']}>{autoAdvanceMode ? pagesAdvanced : pagesReadDuringSession} Pages</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
            <Clock size={12} />
            <span>{Math.floor(elapsed / 60)}m {elapsed % 60}s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8, paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>📖 Velocity:</span>
            <span>{elapsed > 0 ? ((autoAdvanceMode ? pagesAdvanced : pagesReadDuringSession) / (elapsed / 60)).toFixed(1) : '0.0'} PPM</span>
          </div>
        </motion.div>
      )}

      {/* Bottom Footer / Navigation (Hidden in Focus Mode) */}
      {!focusMode && (
        <footer className={`${styles['reading-footer']} ${!isUiVisible ? styles['ui-hidden-direct'] : ''}`}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={styles['btn-icon']}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={styles['btn-icon']}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className={styles['progress-container']}>
            <span className={styles['badge-label']} style={{ minWidth: '80px' }}>Page {currentPage} of {totalPages}</span>
            <div className={styles['progress-bar-main']}>
              <div
                className={styles['progress-fill-main']}
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
            <span className={styles['badge-label']}>{Math.round((currentPage / totalPages) * 100)}%</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleAddHighlight}
              className={styles['btn-pill']}
              title="Highlight selection"
            >
              <Highlighter size={18} />
              <span>Highlight</span>
            </button>
            <button
              onClick={handleAddBookmark}
              className={`${styles['btn-pill']} ${isPageBookmarked ? styles['btn-accent'] : ''}`}
            >
              <BookmarkIcon size={18} />
              <span>{isPageBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </footer>
      )}

      {/* Side Drawers (Hidden in Focus Mode) */}
      <AnimatePresence>
        {!focusMode && leftDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles['sidebar-overlay']}
              onClick={() => setLeftDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150 }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${styles['sidebar-drawer']} ${styles['sidebar-left']}`}
            >
              <div className={styles['drawer-header']}>
                <h3 className={styles['drawer-title']}>My Library</h3>
                <button onClick={() => setLeftDrawerOpen(false)} className={styles['btn-icon']}><X size={20} /></button>
              </div>

              <div className={styles['setting-group']}>
                <span className={styles['setting-label']}>Highlights</span>
                <div className={styles['item-list']} style={{ overflowY: 'auto', maxHeight: '40vh' }}>
                  {highlights.length === 0 ? (
                    <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Select text to create your first highlight.</p>
                  ) : (
                    highlights.map(hl => (
                      <div key={hl.id} className={styles['list-item']} onClick={() => { handleGoToPage(hl.pageNumber); setLeftDrawerOpen(false); }}>
                        <div className={styles['item-content']}>
                          {hl.content.length > 120 ? hl.content.substring(0, 120) + '...' : hl.content}
                        </div>
                        <div className={styles['item-meta']}>
                          <span>Page {hl.pageNumber}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteHighlight(hl.id); }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles['setting-group']} style={{ marginTop: '2rem' }}>
                <span className={styles['setting-label']}>Bookmarks</span>
                <div className={styles['item-list']} style={{ overflowY: 'auto', maxHeight: '30vh' }}>
                  {bookmarks.map(bm => (
                    <div key={bm.id} className={styles['list-item']} onClick={() => { handleGoToPage(bm.pageNumber); setLeftDrawerOpen(false); }}>
                      <div className={styles['item-meta']}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Page {bm.pageNumber}</span>
                        <span>{new Date(bm.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {!focusMode && rightDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles['sidebar-overlay']}
              onClick={() => setRightDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${styles['sidebar-drawer']} ${styles['sidebar-right']}`}
            >
              <div className={styles['drawer-header']}>
                <h3 className={styles['drawer-title']}>Reader Settings</h3>
                <button onClick={() => setRightDrawerOpen(false)} className={styles['btn-icon']}><X size={20} /></button>
              </div>

              <div className={styles['settings-panel']}>
                <div className={styles['setting-group']}>
                  <span className={styles['setting-label']}>Display Theme</span>
                  <div className={styles['theme-selector']}>
                    {['dark', 'sepia', 'light'].map(t => (
                      <div
                        key={t}
                        className={`${styles['theme-card']} ${theme === t ? styles['active'] : ''}`}
                        onClick={() => setTheme(t)}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles['setting-group']}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles['setting-label']}>Zoom Level</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0.5" max="2.5" step="0.1" value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className={styles['custom-slider']}
                  />
                </div>

                <div className={styles['setting-group']}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles['setting-label']}>Brightness</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{brightness}%</span>
                  </div>
                  <input
                    type="range" min="30" max="150" value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className={styles['custom-slider']}
                  />
                </div>

                <div className={styles['setting-group']}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles['setting-label']}>Auto-Advance Mode</span>
                    <div
                      onClick={() => setAutoAdvanceMode(!autoAdvanceMode)}
                      style={{
                        width: '44px', height: '24px', background: autoAdvanceMode ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
                      }}
                    >
                      <motion.div
                        animate={{ x: autoAdvanceMode ? 22 : 2 }}
                        style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', marginTop: '2px' }}
                      />
                    </div>
                  </div>
                  {autoAdvanceMode && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Speed (seconds per page)</span>
                        <span style={{ fontWeight: 700 }}>{selectedSpeed}s</span>
                      </div>
                      <input
                        type="range" min="10" max="180" step="5" value={selectedSpeed}
                        onChange={(e) => setSelectedSpeed(parseInt(e.target.value))}
                        className={styles['custom-slider']}
                      />
                    </div>
                  )}
                </div>

                <div className={styles['setting-group']}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles['setting-label']}>High Contrast</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Enhanced readability</span>
                    </div>
                    <div
                      onClick={() => setHighContrast(!highContrast)}
                      style={{
                        width: '44px', height: '24px', background: highContrast ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
                      }}
                    >
                      <motion.div
                        animate={{ x: highContrast ? 22 : 2 }}
                        style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', marginTop: '2px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles['setting-group']} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <button
                    onClick={async () => {
                      try {
                        if (!book || !book.pdfUrl) return;
                        const url = book.pdfUrl;
                        if (url.startsWith('data:')) {
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                          document.body.appendChild(a); a.click(); a.remove();
                          return;
                        }
                        const resp = await fetch(url);
                        const blob = await resp.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                        document.body.appendChild(a); a.click(); a.remove();
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                      } catch (e) {
                        console.error('Download failed', e);
                      }
                    }}
                    className={styles['btn-pill']}
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <Download size={18} />
                    <span>Download Offline PDF</span>
                  </button>
                </div>

                <div className={styles['setting-group']} style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => {
                      setFocusMode(!focusMode);
                      if (!focusMode) {
                        setRightDrawerOpen(false);
                        setLeftDrawerOpen(false);
                      }
                    }}
                    className={styles['btn-pill']}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {focusMode ? <Minimize size={18} /> : <Maximize size={18} />}
                    <span>{focusMode ? 'Exit Immersive Mode' : 'Enter Immersive Mode'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Text Selection Color Picker Popup ── */}
      {selectionPopup.visible && (
        <div
          ref={selectionPopupRef}
          className={styles['selection-popup']}
          style={{
            left: Math.min(selectionPopup.x, window.innerWidth - 240),
            top: selectionPopup.y,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <span className={styles['selection-popup-label']}>Highlight</span>
          <div className={styles['color-swatch-row']}>
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.name}
                title={c.name}
                className={styles['color-swatch']}
                style={{ background: c.border }}
                onClick={() => handleAddHighlight(c.name)}
              />
            ))}
          </div>
          {selectionPopup.highlightId && (
            <button
              className={styles['selection-popup-remove']}
              title="Remove highlight"
              onClick={() => {
                handleDeleteHighlight(selectionPopup.highlightId);
                setSelectionPopup(prev => ({ ...prev, visible: false }));
              }}
            >🗑</button>
          )}
          <button
            className={styles['selection-popup-close']}
            onClick={() => setSelectionPopup(prev => ({ ...prev, visible: false }))}
          >✕</button>
        </div>
      )}
    </div>
  );

};

export default Reading;
