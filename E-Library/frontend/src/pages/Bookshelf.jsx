// ============================================================
// Bookshelf.jsx — Premium 'Deep Green' Dashboard Overhaul
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/ApiConfig';
import { 
  LayoutDashboard, Book, Star, Target, Plus, 
  Trash2, MoveHorizontal, X, Search, Sparkles,
  BookOpen, ChevronRight, History, Library, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityService } from '../services/ActivityService';
import styles from './Bookshelf.module.css';
import { useTheme } from '../context/ThemeContext';

// --- SUB-COMPONENTS ---

function Toast({ toast }) {
  return (
    <div className={`${styles.toast} ${toast.show ? styles.show : ''}`}>
      <span className={styles.toastIcon}>{toast.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={styles.modal}
      >
        {children}
      </motion.div>
    </div>
  );
}

function PremiumBookCard({ book, listKey, onRemove, onMove, onOpen }) {
  const [imgError, setImgError] = useState(false);
  const cover = book.coverImage || book.cover_image || book.coverUrl;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.bookCard}
      onClick={() => onOpen(book)}
    >
      <div className={styles.cardCoverWrap}>
        {cover && !imgError ? (
          <img src={cover} alt={book.title} className={styles.cardCoverImg} onError={() => setImgError(true)} />
        ) : (
          <div className={styles.placeholderCover}>
             <BookOpen size={40} className={styles.placeholderIcon} />
             <span className={styles.placeholderText}>{book.title}</span>
          </div>
        )}
        
        {/* AI Match Badge */}
        {book.matchScore && (
          <div className={styles.aiBadge}>
            <span className={styles.matchScore}>🎯 {book.matchScore}% Match</span>
          </div>
        )}

        <div className={styles.cardOverlay}>
           <button className={styles.cardActionBtn} title="Move" onClick={(e) => { e.stopPropagation(); onMove(book.id, listKey); }}>
             <MoveHorizontal size={20} />
           </button>
           <button className={`${styles.cardActionBtn} ${styles.delete}`} title="Remove" onClick={(e) => { e.stopPropagation(); onRemove(book.id, listKey); }}>
             <X size={20} />
           </button>
        </div>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.cardCategory}>{book.genre || book.category || "General"}</div>
        <div className={styles.cardTitle} title={book.title}>{book.title}</div>
        <div className={styles.cardAuthor}>{book.author}</div>
        {book.progress > 0 && (
          <div className={styles.miniProgressWrap}>
             <div className={styles.miniProgressFill} style={{ width: `${book.progress}%` }}></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CarouselSection({ id, icon, title, books, listKey, onRemove, onMove, onOpen, onClear, onDelete, showClear }) {
  const isCustom = listKey && listKey.startsWith('custom_');
  const navigate = useNavigate();

  return (
    <div className={styles.sectionContainer} id={id}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          {icon} {title} 
          <span className={styles.count}>{books.length}</span>
        </div>
        <div className={styles.sectionActions}>
          {isCustom && onDelete && (
             <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={onDelete}>
               <Trash2 size={16} /> Delete List
             </button>
          )}
          {showClear && books.length > 0 && (
            <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={() => onClear(listKey)}>Clear All</button>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{icon}</div>
          <h3>Your {title} is empty</h3>
          <p>Discover new books with AI to fill your shelf.</p>
          <button className={styles.exploreBtn} onClick={() => navigate('/books')}>
            📖 Explore Library
          </button>
        </div>
      ) : (
        <div className={styles.carousel}>
          {books.map(book => (
            <PremiumBookCard 
              key={book.id} book={book} listKey={listKey}
              onRemove={onRemove} onMove={onMove} onOpen={onOpen} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Bookshelf() {
  const { theme } = useTheme();
  const API = `${getApiUrl()}/bookshelf`;
  const [authUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : { id: 1, role: 'USER' };
    } catch { return { id: 1, role: 'USER' }; }
  });
  const userId = authUser.id;

  const navigate = useNavigate();
  const [bookshelf, setBookshelf] = useState({ favourites: [], reading: [], wishlist: [] });
  const [customLists, setCustomLists] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Modals & Notifications
  const [newListModal, setNewListModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [pendingClear, setPendingClear] = useState(null);
  const [pendingMove, setPendingMove] = useState({ id: null, from: null });
  const [toast, setToast] = useState({ show: false, icon: '', message: '' });
  const toastTimer = useRef(null);

  const showToast = useCallback((icon, message) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, icon, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/all?userId=${userId}`);
        const rawBooks = await response.json();
        
        if (Array.isArray(rawBooks)) {
          const LIST_MAP = { currentlyReading: 'reading', read: 'favourites', wantToRead: 'wishlist' };
          const books = rawBooks.map(b => ({
            ...b, 
            coverImage: b.coverImage || b.cover_image,
            status: b.status === 'reading' ? 'reading' : b.status === 'completed' ? 'completed' : 'new',
            listName: LIST_MAP[b.listName] || b.listName,
          }));

          setBookshelf({
            favourites: books.filter(b => b.listName === 'favourites'),
            reading: books.filter(b => b.listName === 'reading'),
            wishlist: books.filter(b => b.listName === 'wishlist')
          });

          const customBooks = books.filter(b => !['favourites', 'reading', 'wishlist'].includes(b.listName));
          const grouped = customBooks.reduce((acc, book) => {
            const existing = acc.find(l => l.name === book.listName);
            if (existing) existing.books.push(book);
            else acc.push({ id: `custom_${book.listName}`, name: book.listName, books: [book] });
            return acc;
          }, []);
          setCustomLists(grouped);
        }

        const histResp = await ActivityService.getHistory(userId);
        setHistory(histResp.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Actions
  const removeBook = async (id, listKey) => {
    try {
      await fetch(`${API}/remove/${id}`, { method: 'DELETE' });
      if (listKey.startsWith('custom_')) {
        setCustomLists(p => p.map(l => l.id === listKey ? { ...l, books: l.books.filter(b => b.id !== id) } : l));
      } else {
        setBookshelf(p => ({ ...p, [listKey]: p[listKey].filter(b => b.id !== id) }));
      }
      showToast('🗑️', 'Book removed');
    } catch { showToast('❌', 'Could not remove'); }
  };

  const createNewList = () => {
    if (!newListName.trim()) { showToast('⚠️', 'Enter a list name'); return; }
    const newList = { id: `custom_${newListName.trim()}`, name: newListName.trim(), books: [] };
    setCustomLists(p => [...p, newList]);
    showToast('📌', `List "${newListName}" created!`);
    setNewListName(''); setNewListModal(false);
  };

  const openBook = async (book) => {
    try {
      const resp = await ActivityService.getBooks();
      const globalBook = (resp.data || []).find(b => b.title.toLowerCase() === book.title.toLowerCase());
      if (globalBook) {
        navigate(`/reading/${globalBook.id}?page=${book.currentPage || 1}`);
      } else showToast('❌', 'Book content not found.');
    } catch { showToast('❌', 'Failed to locate book.'); }
  };

  const allBooks = [...Object.values(bookshelf).flat(), ...customLists.flatMap(l => l.books)];
  const recentHero = history.length > 0 ? history[0] : null;

  if (loading) return <div className={styles.loading}>Initializing your sanctuary...</div>;

  return (
    <div className={`${styles.bookshelfContainer} ${styles[theme]}`}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
           <Library className={styles.highlight} size={32} />
           <span>E-Library</span>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Sanctuary</div>
          <div className={`${styles.navItem} ${activeTab === 'summary' ? styles.active : ''}`} onClick={() => setActiveTab('summary')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className={`${styles.navItem} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>
            <Book size={20} />
            <span>All Books</span>
            <span className={styles.navCount}>{allBooks.length}</span>
          </div>

          <div className={styles.navLabel}>My Collections</div>
          <div className={`${styles.navItem} ${activeTab === 'favourites' ? styles.active : ''}`} onClick={() => setActiveTab('favourites')}>
            <Star size={20} />
            <span>Favourites</span>
            <span className={styles.navCount}>{bookshelf.favourites.length}</span>
          </div>
          <div className={`${styles.navItem} ${activeTab === 'wishlist' ? styles.active : ''}`} onClick={() => setActiveTab('wishlist')}>
            <Target size={20} />
            <span>Wishlist</span>
            <span className={styles.navCount}>{bookshelf.wishlist.length}</span>
          </div>

          <div className={styles.navLabel}>Custom Lists</div>
          {customLists.map(cl => (
            <div key={cl.id} className={`${styles.navItem} ${activeTab === cl.id ? styles.active : ''}`} onClick={() => setActiveTab(cl.id)}>
              <Plus size={20} />
              <span>{cl.name}</span>
              <span className={styles.navCount}>{cl.books.length}</span>
            </div>
          ))}
          
          <div className={styles.newListBtn} onClick={() => setNewListModal(true)}>
             <Plus size={18} />
             <span>New List</span>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.navSection} style={{ marginTop: 'auto' }}>
           <div className={styles.navItem} onClick={() => navigate('/activity')}>
             <History size={20} />
             <span>Activity Hub</span>
           </div>
           <div className={styles.navItem} onClick={() => navigate('/books')}>
             <Search size={20} />
             <span>Search AI</span>
           </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className={styles.mainCanvas}>
        

        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div 
               key="summary"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
               {/* Dashboard Cards (Bento style) */}
               <div className={styles.bentoStats}>
                  <div className={styles.bentoCard}>
                     <Library className={styles.bentoIcon} />
                     <div className={styles.bentoVal}>{allBooks.length}</div>
                     <div className={styles.bentoLabel}>Library Size</div>
                  </div>
                  <div className={styles.bentoCard}>
                     <Star className={styles.bentoIcon} />
                     <div className={styles.bentoVal}>{bookshelf.favourites.length}</div>
                     <div className={styles.bentoLabel}>Top Rated</div>
                  </div>
                  <div className={styles.bentoCard}>
                     <History className={styles.bentoIcon} />
                     <div className={styles.bentoVal}>{history.length}</div>
                     <div className={styles.bentoLabel}>Sessions</div>
                  </div>
               </div>

               {/* Active Hero */}
               {recentHero && (
                  <section className={styles.heroSection}>
                     <div className={styles.cinematicHero} onClick={() => openBook(recentHero)}>
                        <div className={styles.heroContent}>
                           <div className={styles.heroBadge}>Active Session</div>
                           <h1 className={styles.heroTitle}>{recentHero.title}</h1>
                           <p className={styles.heroAuthor}>by {recentHero.author || "Unknown Author"}</p>
                           
                           <div className={styles.heroStats}>
                              <div className={styles.heroStat}>
                                 <span className={styles.heroStatVal}>{recentHero.timeSpent || 0}m</span>
                                 <span className={styles.heroStatLbl}>Time Focused</span>
                              </div>
                              <div className={styles.heroStat}>
                                 <span className={styles.heroStatVal}>{recentHero.currentPage || 1}</span>
                                 <span className={styles.heroStatLbl}>Current Page</span>
                              </div>
                           </div>

                           <div className={styles.heroProgressWrap}>
                              <div 
                                className={styles.heroProgressFill} 
                                style={{ width: `${Math.min(100, ((recentHero.currentPage||0)/(recentHero.totalPages||100))*100)}%` }}
                              ></div>
                           </div>
                        </div>

                        <div className={styles.heroImageWrap}>
                           <div className={styles.heroCover}>
                              <img src={recentHero.coverUrl || recentHero.cover_url} alt="" />
                           </div>
                        </div>
                     </div>
                  </section>
               )}

               <CarouselSection 
                  icon={<Star size={24} />} title="Favourites" 
                  books={bookshelf.favourites} listKey="favourites"
                  onRemove={removeBook} onOpen={openBook}
               />
               <CarouselSection 
                  icon={<Target size={24} />} title="Want to Read" 
                  books={bookshelf.wishlist} listKey="wishlist"
                  onRemove={removeBook} onOpen={openBook}
               />
            </motion.div>
          )}

          {activeTab === 'all' && (
            <CarouselSection 
               key="all" icon={<Book size={24} />} title="All Books" 
               books={allBooks} listKey="all"
               onRemove={removeBook} onOpen={openBook}
            />
          )}

          {activeTab === 'favourites' && (
            <CarouselSection 
               key="fav" icon={<Star size={24} />} title="Favourites" 
               books={bookshelf.favourites} listKey="favourites"
               onRemove={removeBook} onOpen={openBook}
            />
          )}

          {activeTab === 'wishlist' && (
            <CarouselSection 
               key="wish" icon={<Target size={24} />} title="Want to Read" 
               books={bookshelf.wishlist} listKey="wishlist"
               onRemove={removeBook} onOpen={openBook}
            />
          )}

          {activeTab.startsWith('custom_') && (
            customLists.filter(l => l.id === activeTab).map(cl => (
              <CarouselSection 
                key={cl.id} icon={<Plus size={24} />} title={cl.name}
                books={cl.books} listKey={cl.id}
                onRemove={removeBook} onOpen={openBook}
                onDelete={() => { /* Implement delete list logic */ }}
              />
            ))
          )}
        </AnimatePresence>
      </main>

      {/* MODALS */}
      <Modal isOpen={newListModal} onClose={() => setNewListModal(false)}>
        <h3>Create Sanctuary List</h3>
        <p>Curate your reading experience with a new collection.</p>
        <input type="text" placeholder="e.g. Midnight Thrillers" 
          value={newListName} onChange={e => setNewListName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createNewList()} autoFocus />
        <div className={styles.modalActions}>
           <button className={styles.cancelBtn} onClick={() => setNewListModal(false)}>Cancel</button>
           <button className={styles.confirmBtn} onClick={createNewList}>Create</button>
        </div>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
