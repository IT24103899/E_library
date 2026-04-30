import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Sparkles, AlertCircle, PlayCircle, Award, Book } from 'lucide-react';
import AIRecommendation from '../components/AIRecommendation';
import { ActivityService } from '../services/ActivityService';
import { getApiUrl, getRankerUrl } from '../config/ApiConfig';
import styles from './ActivityDashboard.module.css';

const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');
  const [aiRecs, setAiRecs] = useState([]);
  const [brokenRecImages, setBrokenRecImages] = useState({});

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('appTheme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  useEffect(() => {
    if (currentBook && (currentBook.bookId || currentBook.id)) {
      fetchRecommendedBooks(currentBook);
    } else if (currentBook === null && !loading) {
      // No reading history — show discovery picks from Python AI
      fetchRecommendedBooks(null);
    }
  }, [currentBook, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const uid = authUser.id || 1;
      const statsRes = await ActivityService.getStats(uid);
      const historyRes = await ActivityService.getHistory(uid);
      
      setStats(statsRes.data);

      const rawHistory = historyRes.data || [];
      const enhanced = await Promise.all(
        rawHistory.map(async (h) => {
          const bookId = h.bookId || h.book?.id || h.id;
          try {
            const response = await ActivityService.getProgress(uid, bookId);
            const prog = response?.data || response;
            const hp = h || {};
            const bookMeta = hp.book || {};
            const currentPageFromHistory = hp.currentPage ?? hp.pageNumber ?? hp.page ?? 0;
            const totalPagesFromHistory = hp.totalPages ?? bookMeta.totalPages ?? 0;
            const currentPage = prog?.currentPage ?? currentPageFromHistory ?? 0;
            const totalPages = prog?.totalPages ?? totalPagesFromHistory ?? 0;
            return { ...h, currentPage, totalPages };
          } catch (e) {
            return { ...h };
          }
        })
      );

      // Deduplicate by bookId — keep only the most recent entry per book
      const seen = new Map();
      for (const item of enhanced) {
        const key = item.bookId || item.id;
        if (!seen.has(key)) {
          seen.set(key, item);
        } else {
          const existing = seen.get(key);
          const existingTime = existing.lastRead ? new Date(existing.lastRead) : new Date(0);
          const itemTime = item.lastRead ? new Date(item.lastRead) : new Date(0);
          if (itemTime > existingTime) {
            seen.set(key, item);
          }
        }
      }
      const deduplicated = Array.from(seen.values());

      setHistory(deduplicated);
      setCurrentBookIndex(0);
      if (deduplicated.length > 0) {
        setCurrentBook(deduplicated[0]);
      } else {
        fetchRecommendedBooks(null);
      }
    } catch (err) {
      setError('Unable to load data. Please ensure the backend is running.');
      setStats({ readingVelocity: 20, currentStreak: 3, booksRead: 2 });
      setHistory([]);
      fetchRecommendedBooks(null);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousBook = () => {
    if (history.length === 0) return;
    const newIndex = currentBookIndex === 0 ? history.length - 1 : currentBookIndex - 1;
    setCurrentBookIndex(newIndex);
    setCurrentBook(history[newIndex]);
  };

  const goToNextBook = () => {
    if (history.length === 0) return;
    const newIndex = (currentBookIndex + 1) % history.length;
    setCurrentBookIndex(newIndex);
    setCurrentBook(history[newIndex]);
  };

  const mapRec = (rec) => ({
    id: parseInt(rec.id || rec.book_id || 0),
    bookId: parseInt(rec.book_id || rec.id || 0),
    title: rec.title || 'Unknown Title',
    author: rec.author || 'Unknown Author',
    coverUrl: rec.cover_url || rec.coverUrl || '',
    category: rec.category || '',
    matchScore: parseFloat(rec.match_score || rec.matchScore) || 0,
    description: rec.description || ''
  });

  const fetchRecommendedBooks = async (book = null) => {
    try {
      const mlUrl = getRankerUrl();
      const bookToUse = book || currentBook;

      // Step 1: If we have a book title, fetch similar books from AI
      if (bookToUse && bookToUse.title) {
        try {
          const response = await fetch(`${mlUrl}/recommend/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: bookToUse.title || '',
              description: bookToUse.description || '',
              id: bookToUse.bookId || bookToUse.id || 0
            })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.recommendations && data.recommendations.length > 0) {
              setAiRecs(data.recommendations.slice(0, 5).map(mapRec));
              return;
            }
          }
        } catch (_) {}
      }

      // Step 2: No book or AI failed — ask Python for popular picks (discovery mode)
      try {
        const response = await fetch(`${mlUrl}/recommend/personal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookIds: [], limit: 5 })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.recommendations && data.recommendations.length > 0) {
            setAiRecs(data.recommendations.slice(0, 5).map(mapRec));
            return;
          }
        }
      } catch (_) {}

      // Step 3: Ultimate fallback — Spring Boot book list
      try {
        const response = await ActivityService.getBooks();
        const books = response.data || [];
        if (books.length > 0) {
          const shuffled = [...books].sort(() => Math.random() - 0.5);
          setAiRecs(shuffled.slice(0, 5));
        }
      } catch (_) {
        setAiRecs([]);
      }
    } catch (err) {
      setAiRecs([]);
    }
  };

  if (loading) {
    return (
      <div className={styles['activitydashboard-main']} data-theme={theme}>
        <div className={styles['dashboard-container']}>
          <div className={styles['loading-overlay']}>
            <div className={styles.spinner}></div>
            <p style={{ fontSize: '1.2rem', fontWeight: '600', opacity: 0.7 }}>Loading your library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={styles['activitydashboard-main']} data-theme={theme}>
      <div className={styles['dashboard-container']}>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-primary)'
          }}>
            <AlertCircle size={20} color="currentColor" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Premium 3D Hero Section */}
        {currentBook ? (
          <section className={styles['hero-3d-section']}>
            <div className={styles['floating-badge-1']}>⭐</div>
            <div className={styles['floating-badge-2']}>📖</div>
            <div className={styles['floating-badge-3']}>✨</div>
            <div className={styles['floating-badge-4']}>🔥</div>
            <div className={styles['floating-badge-5']}>⚡</div>

            {/* Navigation arrows - Left */}
            {history.length > 1 && (
              <button
                className={styles['hero-nav-arrow']}
                onClick={goToPreviousBook}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ❮
              </button>
            )}

            <div className={styles['hero-3d-container']}>
              <div className={styles['hero-book-3d']}>
                {currentBook?.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className={styles['hero-book-3d-cover']}
                  />
                ) : (
                  <div className={styles['hero-book-3d-empty']}>📕</div>
                )}
              </div>

              <div className={styles['hero-3d-content']}>
                <div className={styles['hero-status-label']}>
                  <Sparkles size={14} /> RESUME READING
                </div>

                <h1 className={styles['hero-3d-title']}>
                  {currentBook.title || 'Untitled Book'}
                </h1>

                <p className={styles['hero-3d-author']}>
                  {`by ${currentBook.author || 'Unknown Author'}`}
                </p>

                <div className={styles['hero-quick-stats']}>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {Math.round(((currentBook.currentPage || 0) / Math.max(currentBook.totalPages || 1, 1)) * 100)}%
                    </span>
                    <span className={styles['stat-label']}>COMPLETE</span>
                  </div>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {currentBook.currentPage || 0}
                    </span>
                    <span className={styles['stat-label']}>PAGES</span>
                  </div>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {Math.max(0, (currentBook.totalPages || 0) - (currentBook.currentPage || 0))}
                    </span>
                    <span className={styles['stat-label']}>LEFT</span>
                  </div>
                </div>

                <div className={styles['hero-progress-section']}>
                  <div className={styles['progress-bar-bg']}>
                    <div
                      className={styles['progress-bar-fill']}
                      style={{
                        width: `${Math.min(100, ((currentBook.currentPage || 0) / Math.max(currentBook.totalPages || 1, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className={styles['hero-actions']}>
                  <button
                    className={styles['hero-btn-primary']}
                    onClick={() => navigate(`/reading/${currentBook.bookId || currentBook.id}?page=${currentBook.currentPage || 1}`)}
                  >
                    <PlayCircle size={18} /> Continue Reading
                  </button>
                  <button
                    className={styles['hero-btn-secondary']}
                    onClick={async () => {
                      try {
                        const apiUrl = getApiUrl();
                        const res = await fetch(`${apiUrl}/bookshelf/add`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: authUser?.id || 1,
                            bookId: currentBook.bookId || currentBook.id,
                            title: currentBook.title,
                            author: currentBook.author || 'Unknown',
                            emoji: '❤️',
                            genre: currentBook.category || 'General',
                            rating: 0,
                            status: 'new',
                            progress: 0,
                            listName: 'favourites',
                            coverImage: currentBook.coverUrl || currentBook.cover_url || ''
                          })
                        });
                        if (res.ok) alert(`❤️ "${currentBook.title}" added to favorites!`);
                        else alert('❌ Failed to add to favorites');
                      } catch (err) { alert('Error adding book to favorites'); }
                    }}
                  >
                    <Award size={18} /> Favourite
                  </button>
                </div>

                {/* Book indicators - dots */}
                {history.length > 1 && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginTop: '20px'
                  }}>
                    {history.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentBookIndex(idx);
                          setCurrentBook(history[idx]);
                        }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: 'none',
                          background: idx === currentBookIndex ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={history[idx].title}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation arrows - Right */}
            {history.length > 1 && (
              <button
                className={styles['hero-nav-arrow']}
                onClick={goToNextBook}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ❯
              </button>
            )}
          </section>
        ) : (
          <section className={styles['hero-3d-section']} style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <Activity size={50} style={{ margin: '0 auto 1.5rem', color: 'var(--accent-gold)' }} />
              <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>No reading activity yet</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Start your literary journey to see your progress here.</p>
            </div>
          </section>
        )}

        {/* Modern Reading Progress Section */}
        {history && history.length > 0 && (
          <section className={styles['modern-activity-section']}>
            <div className={styles['section-header-modern']}>
              <div>
                <h2 className={styles['modern-section-title']}>Continue Your Journey</h2>
                <p className={styles['modern-section-subtitle']}>Pick up where you left off</p>
              </div>
              <div className={styles['section-badge']}>{history.length} In Progress</div>
            </div>

            <div className={styles['modern-activity-grid']}>
              {history.map((book) => {
                const progress = Math.round(((book.currentPage || 0) / Math.max(book.totalPages || 1, 1)) * 100);
                return (
                  <div
                    key={book.id}
                    className={styles['modern-activity-card']}
                    onClick={() => navigate(`/reading/${book.bookId || book.id}?page=${book.currentPage || 1}`)}
                  >
                    <div className={styles['card-visual-wrapper']}>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className={styles['modern-card-image']}
                        />
                      ) : (
                        <div className={styles['modern-card-placeholder']}>📚</div>
                      )}
                      <div className={styles['card-progress-overlay']}>
                        <div className={styles['progress-ring']}>
                          <svg viewBox="0 0 100 100" className={styles['progress-svg']}>
                            <circle cx="50" cy="50" r="45" className={styles['progress-circle-bg']} />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              className={styles['progress-circle-fill']}
                              style={{
                                strokeDashoffset: 283 - (283 * progress / 100)
                              }}
                            />
                          </svg>
                          <div className={styles['progress-text']}>{progress}%</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles['modern-card-content']}>
                      <h4 className={styles['modern-card-title']}>{book.title}</h4>
                      <p className={styles['modern-card-author']}>{book.author}</p>
                      <div className={styles['modern-card-stats']}>
                        <span className={styles['stat-badge']}>
                          📖 {book.currentPage}/{book.totalPages} pages
                        </span>
                      </div>
                      <button className={styles['modern-card-cta']}>
                        Continue Reading →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* THE LITERARY PULSE (Modern Analytical Dashboard) */}
        {(stats) && (
          <section className={styles['pulse-section']}>
            <div className={styles['pulse-header']}>
              <div className={styles['pulse-title-wrap']}>
                <span className={styles['pulse-subtitle']}>Analytical Overview</span>
                <h2 className={styles['pulse-title']}>The Literary Pulse</h2>
              </div>
              <div className={styles['spectrum-wrap']}>
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div 
                    key={i} 
                    className={styles['spectrum-bar']} 
                    style={{ height: `${h}%`, transitionDelay: `${i * 0.1}s` }}
                    title={`Day ${i + 1}: ${h}% Intensity`}
                  />
                ))}
              </div>
            </div>

            <div className={styles['pulse-grid']}>
              {/* Velocity Card */}
              <div className={`${styles['pulse-card']} ${styles['glow-animation']}`}>
                <div className={`${styles['pulse-icon-glow']} ${styles['emerald-glow']}`}>
                  <Activity size={28} />
                </div>
                <div className={styles['pulse-value']}>{stats.readingVelocity || 0}</div>
                <div className={styles['pulse-label']}>Pages Read</div>
              </div>

              {/* Streak Card */}
              <div className={styles['pulse-card']}>
                <div className={`${styles['pulse-icon-glow']} ${styles['gold-glow']}`}>
                  <Award size={28} />
                </div>
                <div className={styles['pulse-value']}>{stats.currentStreak || 0}</div>
                <div className={styles['pulse-label']}>Day Streak</div>
              </div>

              {/* Books Completed Card */}
              <div className={styles['pulse-card']}>
                <div className={`${styles['pulse-icon-glow']} ${styles['purple-glow']}`}>
                  <Book size={28} />
                </div>
                <div className={styles['pulse-value']}>{stats.booksRead || 0}</div>
                <div className={styles['pulse-label']}>Volumes Unveiled</div>
              </div>

              {/* Mastery Tier Section */}
              <div className={styles['tier-section']}>
                <div className={styles['tier-badge-visual']}>
                  {stats.booksRead > 10 ? '🧙‍♂️' : stats.booksRead > 5 ? '📖' : '🌱'}
                </div>
                <div className={styles['tier-content']}>
                  <div className={styles['tier-name']}>
                    {stats.booksRead > 10 ? 'Eternal Scholar' : stats.booksRead > 5 ? 'Diligent Sage' : 'Novice Observer'}
                  </div>
                  <div className={styles['pulse-subtitle']}>Path to Literary Mastery</div>
                  <div className={styles['tier-progress-track']}>
                    <div 
                      className={styles['tier-progress-fill']} 
                      style={{ width: `${Math.min(100, (stats.booksRead / 20) * 100)}%` }} 
                    />
                  </div>
                  <div className={styles['tier-next']}>
                    <span>Current Level: {Math.floor(stats.booksRead / 2) + 1}</span>
                    <span>Next Tier: {Math.min(100, Math.round((stats.booksRead / 20) * 100))}% toward Ascension</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {aiRecs && aiRecs.length > 0 && (
          <section>
            <h2 className={styles['section-header']}>
              <Sparkles size={28} color="#fbbf24" /> AI Recommendations
            </h2>
            <div className={styles['recommendations-grid']}>
              {aiRecs.map((book, idx) => (
                <article
                  key={idx}
                  className={styles['recommendation-card']}
                  onClick={() => navigate(`/reading/${book.bookId || book.id}?page=1`)}
                >
                  <div className={styles['rec-image-wrapper']}>
                    {book.coverUrl && !brokenRecImages[idx] ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className={styles['rec-image']}
                        onLoad={(e) => {
                          if (e.target.naturalWidth < 10 || e.target.naturalHeight < 10) {
                            setBrokenRecImages(prev => ({ ...prev, [idx]: true }));
                          }
                        }}
                        onError={() => setBrokenRecImages(prev => ({ ...prev, [idx]: true }))}
                      />
                    ) : (
                      <div className={styles['rec-placeholder']} style={{
                        background: `linear-gradient(135deg, ${['#1e3a5f','#2d4a22','#3b1f4e','#1a3a3a','#4a2020'][idx % 5]}, ${['#0f2540','#1a2e14','#24133a','#0d2525','#2e1414'][idx % 5]})`
                      }}>
                        <span className={styles['rec-initials']}>
                          {book.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </span>
                        <span className={styles['rec-no-cover-label']}>No Cover</span>
                      </div>
                    )}
                    <div className={styles['rec-overlay']}>
                      <span className={styles['rec-read-btn']}>Read Now →</span>
                    </div>
                    {book.matchScore > 0 && (
                      <div className={styles['rec-badge']}>
                        {Math.round(book.matchScore)}% Match
                      </div>
                    )}
                  </div>
                  <div className={styles['rec-content']}>
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ActivityDashboard;
