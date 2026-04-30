import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ActivityService } from '../services/ActivityService';
import MobileThemeSwitcher from '../components/MobileThemeSwitcher';
import MobileFeedback from '../components/MobileFeedback';
import AdminAccessModal from '../components/AdminAccessModal';
import styles from './UserDashboard.module.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('Recommended');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAdminAccessOpen, setIsAdminAccessOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));

    // Fetch some books for the bottom grid
    ActivityService.getBooks()
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setSuggestedBooks(res.data.slice(0, 8)); // Top 8 books
        }
      })
      .catch(err => {
        console.error('Failed to load books for dashboard', err);
        // Fallback for visual testing
        setSuggestedBooks([
          { id: 1, title: 'The Shadow of the Wind', author: 'Carlos Ruiz', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300', rating: 4.8 },
          { id: 2, title: 'City of Ghosts', author: 'V.E. Schwab', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300', rating: 4.5 },
          { id: 3, title: 'Midnight Library', author: 'Matt Haig', coverUrl: 'https://images.unsplash.com/photo-1543002588-d83cea6bfbad?auto=format&fit=crop&q=80&w=300', rating: 4.9 },
          { id: 4, title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300', rating: 4.9 }
        ]);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      
      {/* --- HERO SECTION --- (Deep Green animated) */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              Welcome back,<br />
              <span>{authUser?.fullName ? authUser.fullName.split(' ')[0] : 'Scholar'}</span>
            </h1>
            <p className={styles.subtitle}>
              Dive into thousands of premium digital books. Track your progress, organize your shelves, and explore new worlds every single day.
            </p>

            <form onSubmit={handleSearch} className={styles.searchWrapper}>
              <input 
                type="text" 
                className={styles.searchInput}
                placeholder="Search author, title, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>
          </div>

          <div className={styles.heroVisual}>
             <div className={styles.shelfBase}></div>
             <div className={styles.booksContainer}>
                {suggestedBooks.length >= 3 ? (
                  <>
                    <img src={suggestedBooks[0].coverUrl || suggestedBooks[0].cover_url || suggestedBooks[0].coverImage} alt="Book" className={`${styles.shelfBook} ${styles.sb1}`} />
                    <img src={suggestedBooks[1].coverUrl || suggestedBooks[1].cover_url || suggestedBooks[1].coverImage} alt="Book" className={`${styles.shelfBook} ${styles.sb2}`} />
                    <img src={suggestedBooks[2].coverUrl || suggestedBooks[2].cover_url || suggestedBooks[2].coverImage} alt="Book" className={`${styles.shelfBook} ${styles.sb3}`} />
                  </>
                ) : (
                  <>
                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300" alt="Sample" className={`${styles.shelfBook} ${styles.sb1}`} />
                    <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300" alt="Sample" className={`${styles.shelfBook} ${styles.sb2}`} />
                    <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300" alt="Sample" className={`${styles.shelfBook} ${styles.sb3}`} />
                  </>
                )}
             </div>
          </div>
        </div>
      </section>

      {/* --- MOBILE THEME SWITCHER (New) --- */}
      <div className={styles.mobileOnly}>
        <MobileThemeSwitcher />
      </div>

      {/* --- QUICK ACCESS BANNERS --- (Overlaps the curve) */}
      <div className={styles.bannersWrapper}>
        <div className={styles.navBanner} onClick={() => navigate('/activity')}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>Activity Dashboard</div>
            <div className={styles.bannerSub}>Track reading velocity & progress</div>
          </div>
          <div className={styles.bannerVisual}>📈</div>
        </div>

        <div className={styles.navBanner} onClick={() => navigate('/bookshelf')}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>My Bookshelf</div>
            <div className={styles.bannerSub}>Your curated personal library</div>
          </div>
          <div className={styles.bannerVisual}>📚</div>
        </div>

        <div className={styles.navBanner} onClick={() => navigate('/books')}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>Browse Catalog</div>
            <div className={styles.bannerSub}>Discover new amazing titles</div>
          </div>
          <div className={styles.bannerVisual}>🌐</div>
        </div>

        <div className={styles.navBanner} onClick={() => setIsFeedbackOpen(true)}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>Send Feedback</div>
            <div className={styles.bannerSub}>Help us improve the community</div>
          </div>
          <div className={styles.bannerVisual}>✨</div>
        </div>

        <div className={styles.navBanner} onClick={() => setIsAdminAccessOpen(true)}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>Request Admin Access</div>
            <div className={styles.bannerSub}>Become a library administrator</div>
          </div>
          <div className={styles.bannerVisual}>🔐</div>
        </div>
      </div>

      {/* --- POPULAR BOOKS GRID --- */}
      <section className={styles.bottomSection}>
        <div className={styles.sectionHeader}>
          <h3>Library Highlights</h3>
          <div className={styles.sectionFilters}>
            <button className={`${styles.filterBtn} ${filter === 'Recommended' ? styles.filterActive : ''}`} onClick={() => setFilter('Recommended')}>Recommended</button>
            <button className={`${styles.filterBtn} ${filter === 'Newest' ? styles.filterActive : ''}`} onClick={() => setFilter('Newest')}>Newest Arrivals</button>
          </div>
        </div>

        <div className={styles.booksGrid}>
          {suggestedBooks.map((book, idx) => (
            <div key={idx} className={styles.bookCard} onClick={() => navigate(`/reading/${book.id || book.bookId}?page=1`)}>
              <img src={book.coverUrl || book.cover_url || book.coverImage || 'https://images.unsplash.com/photo-1543002588-d83cea6bfbad?w=300'} alt={book.title} className={styles.bcCover} />
              <div className={styles.bcTitle}>{book.title}</div>
              <div className={styles.bcAuthor}>{book.author || 'Unknown'}</div>
              <div className={styles.bcFooter}>
                <span className={styles.bcRating}>★ {book.rating || 4.5}</span>
                <span className={styles.bcAction}>View Book</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MobileFeedback isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      {authUser && isAdminAccessOpen && (
        <AdminAccessModal 
          user={authUser} 
          onClose={() => setIsAdminAccessOpen(false)}
          onRoleUpdated={(newRole) => {
            setAuthUser({...authUser, role: newRole});
            localStorage.setItem('authUser', JSON.stringify({...authUser, role: newRole}));
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
