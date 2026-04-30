# Quick Implementation Guide - Top 3 Advanced Features

## 🎯 Why These 3 Features?
1. **High user value** - Users will immediately benefit
2. **Fast to implement** - Can be done in 2-3 weeks
3. **Build foundation** - Prepares for future features
4. **Professional polish** - Makes app feel complete

---

## Feature 1️⃣: Dark Mode (Whole App Enhancement) ⏱️ 3-4 Days

### Step 1: Create Theme Context
**File:** `frontend/src/context/ThemeContext.jsx`

```javascript
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Step 2: Create Custom Hook
**File:** `frontend/src/hooks/useTheme.js`

```javascript
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Step 3: Update App.js
```javascript
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}
```

### Step 4: Create Theme CSS
**File:** `frontend/src/styles/theme.css`

```css
:root[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent: #5e2dd6;
  --accent-light: #ede9fe;
  --card-bg: #ffffff;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

:root[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --border-color: #334155;
  --accent: #7c3aed;
  --accent-light: #312e81;
  --card-bg: #1e293b;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.card {
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Step 5: Update Theme Toggle Component
**File:** `frontend/src/components/ThemeToggle.jsx`

```javascript
import { useTheme } from '../hooks/useTheme';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={styles.toggle}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};
```

---

## Feature 2️⃣: Reading Statistics Dashboard ⏱️ 5-6 Days

### Step 1: Create Stat Models

**Backend:** `ReadingStats.java`
```java
@Entity @Table(name = "reading_statistics")
public class ReadingStats {
    @Id @GeneratedValue private Long id;
    private Long userId;
    private Integer totalPagesRead;
    private Integer booksCompleted;
    private Integer booksStarted;
    private Integer currentStreak; // consecutive days
    private LocalDateTime lastReadDate;
    private Double averageReadingTimeMinutesPerDay;
}
```

**Database Migration:**
```sql
CREATE TABLE reading_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    total_pages_read INT DEFAULT 0,
    books_completed INT DEFAULT 0,
    books_started INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    last_read_date DATE,
    avg_reading_time_per_day DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE daily_reading_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reading_date DATE,
    pages_read INT,
    time_spent_minutes INT,
    UNIQUE KEY unique_user_date (user_id, reading_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Step 2: Create Frontend Components

**File:** `frontend/src/components/StatsCard.jsx` (enhance existing)
```javascript
import styles from './StatsCard.module.css';

export const StatsCard = ({ icon, label, value, trend, color = 'primary' }) => {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h3 className={styles.label}>{label}</h3>
        <p className={styles.value}>{value}</p>
        {trend && <span className={styles.trend}>↑ {trend}</span>}
      </div>
    </div>
  );
};
```

**File:** `frontend/src/components/ReadingChart.jsx` (NEW)
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './ReadingChart.module.css';

export const ReadingChart = ({ data, title }) => {
  return (
    <div className={styles.chartContainer}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pagesRead" stroke="#5e2dd6" />
          <Line type="monotone" dataKey="timeSpent" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

**File:** `frontend/src/pages/ReadingStatsPage.jsx` (NEW)
```javascript
import React, { useEffect, useState } from 'react';
import { ActivityService } from '../services/ActivityService';
import { StatsCard } from '../components/StatsCard';
import { ReadingChart } from '../components/ReadingChart';
import styles from './ReadingStatsPage.module.css';

export const ReadingStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // TODO: Implement API call to fetch stats
    // ActivityService.getReadingStats(user.id)
  }, []);

  return (
    <div className={styles.container}>
      <h1>📊 My Reading Stats</h1>
      
      <div className={styles.statsGrid}>
        <StatsCard icon="📖" label="Books Completed" value={stats?.booksCompleted || 0} />
        <StatsCard icon="📄" label="Pages Read" value={stats?.totalPagesRead || 0} />
        <StatsCard icon="🔥" label="Current Streak" value={stats?.currentStreak || 0} color="danger" />
        <StatsCard icon="⏱️" label="Avg Daily Time" value={`${stats?.avgTime || 0}m`} />
      </div>

      <div className={styles.charts}>
        <ReadingChart data={chartData} title="Pages Read Per Day (Last 30 Days)" />
        <ReadingChart data={chartData} title="Reading Time Per Day" />
      </div>
    </div>
  );
};
```

### Step 3: Create Backend Service

**File:** `StatsService.java`
```java
@Service
public class StatsService {
    
    @Autowired private ReadingStatsRepository statsRepository;
    @Autowired private ActivityLogRepository activityRepository;
    
    public ReadingStats getOrCreateStats(Long userId) {
        return statsRepository.findByUserId(userId)
            .orElseGet(() -> {
                ReadingStats stats = new ReadingStats();
                stats.setUserId(userId);
                return statsRepository.save(stats);
            });
    }
    
    @Transactional
    public void updateDailyStats(Long userId, Integer pagesRead, Integer timeSpent) {
        LocalDate today = LocalDate.now();
        
        // Update daily log
        Optional<DailyReadingLog> dailyLog = logRepository
            .findByUserIdAndReadingDate(userId, today);
        
        if (dailyLog.isPresent()) {
            DailyReadingLog log = dailyLog.get();
            log.setPagesRead(log.getPagesRead() + pagesRead);
            log.setTimeSpentMinutes(log.getTimeSpentMinutes() + timeSpent);
            logRepository.save(log);
        } else {
            DailyReadingLog log = new DailyReadingLog();
            log.setUserId(userId);
            log.setReadingDate(today);
            log.setPagesRead(pagesRead);
            log.setTimeSpentMinutes(timeSpent);
            logRepository.save(log);
        }
        
        // Update overall stats
        ReadingStats stats = getOrCreateStats(userId);
        stats.setTotalPagesRead(stats.getTotalPagesRead() + pagesRead);
        stats.setLastReadDate(LocalDateTime.now());
        stats.setCurrentStreak(calculateStreak(userId));
        statsRepository.save(stats);
    }
    
    public Map<String, Object> getMonthlyStats(Long userId, int month, int year) {
        List<DailyReadingLog> logs = logRepository
            .findMonthlyLogs(userId, month, year);
        
        return Map.of(
            "totalPages", logs.stream().mapToInt(DailyReadingLog::getPagesRead).sum(),
            "totalTime", logs.stream().mapToInt(DailyReadingLog::getTimeSpentMinutes).sum(),
            "readingDays", logs.size(),
            "dailyData", logs
        );
    }
}
```

---

## Feature 3️⃣: Reading Notes & Highlights ⏱️ 6-7 Days

### Step 1: Create Database Tables
```sql
CREATE TABLE book_highlights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    page_number INT,
    text_content LONGTEXT,
    color_tag VARCHAR(20), -- 'yellow', 'blue', 'pink'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    INDEX idx_user_book (user_id, book_id)
);

CREATE TABLE book_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    page_number INT,
    note_content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    INDEX idx_user_book (user_id, book_id)
);
```

### Step 2: Create Backend Models & Controller

**Model:**
```java
@Entity @Table(name = "book_highlights")
public class BookHighlight {
    @Id @GeneratedValue private Long id;
    @Column private Long userId;
    @Column private Long bookId;
    @Column private Integer pageNumber;
    @Column(columnDefinition = "LONGTEXT") private String textContent;
    @Column private String colorTag;
    @Column private LocalDateTime createdAt;
}
```

**Controller:**
```java
@RestController
@RequestMapping("/notes")
public class NotesController {
    
    @PostMapping("/highlight")
    public ResponseEntity<?> addHighlight(
        @RequestParam Long userId,
        @RequestParam Long bookId,
        @RequestBody Map<String, Object> body
    ) {
        // Save highlight
    }
    
    @GetMapping("/highlights")
    public ResponseEntity<?> getHighlights(
        @RequestParam Long userId,
        @RequestParam Long bookId
    ) {
        // Return all highlights for book
    }
    
    @PostMapping("/note")
    public ResponseEntity<?> addNote(
        @RequestParam Long userId,
        @RequestParam Long bookId,
        @RequestBody Map<String, Object> body
    ) {
        // Save note
    }
}
```

### Step 3: Create Frontend Components

**File:** `frontend/src/components/HighlightBar.jsx` (NEW)
```javascript
import styles from './HighlightBar.module.css';

export const HighlightBar = ({ selectedText, onHighlight, onNote }) => {
  if (!selectedText) return null;

  return (
    <div className={styles.toolbar}>
      <button 
        className={`${styles.btn} ${styles.yellow}`}
        onClick={() => onHighlight('yellow')}
        title="Highlight in yellow"
      >
        🟨
      </button>
      <button 
        className={`${styles.btn} ${styles.blue}`}
        onClick={() => onHighlight('blue')}
        title="Highlight in blue"
      >
        🟦
      </button>
      <button 
        className={`${styles.btn} ${styles.pink}`}
        onClick={() => onHighlight('pink')}
        title="Highlight in pink"
      >
        🟩
      </button>
      <button 
        className={`${styles.btn} ${styles.note}`}
        onClick={onNote}
        title="Add note"
      >
        📝
      </button>
    </div>
  );
};
```

**File:** `frontend/src/components/NotesPanel.jsx` (NEW)
```javascript
import styles from './NotesPanel.module.css';

export const NotesPanel = ({ bookId, notes, onAddNote, onDeleteNote }) => {
  const [newNote, setNewNote] = useState('');

  return (
    <div className={styles.panel}>
      <h3>📝 Notes & Highlights</h3>
      
      <div className={styles.addNoteForm}>
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Add a note..."
        />
        <button onClick={() => {
          onAddNote(newNote);
          setNewNote('');
        }}>
          Save Note
        </button>
      </div>

      <div className={styles.notesList}>
        {notes.map(note => (
          <div key={note.id} className={styles.noteItem}>
            <p className={styles.pageNum}>Page {note.pageNumber}</p>
            <p className={styles.content}>{note.content}</p>
            <button 
              className={styles.deleteBtn}
              onClick={() => onDeleteNote(note.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Step 4: Integrate into Reading.jsx

Add to Reading.jsx:
```javascript
const [highlights, setHighlights] = useState([]);
const [notes, setNotes] = useState([]);

const handleTextSelection = () => {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    setSelectedText(selectedText);
    // Show highlight bar
  }
};

const handleAddHighlight = async (color) => {
  await ActivityService.addHighlight({
    userId, bookId, currentPage, selectedText, color
  });
  loadHighlights();
};

// Use in rendering:
<NotesPanel 
  bookId={bookId} 
  notes={notes}
  onAddNote={handleAddNote}
/>
```

---

## 📋 Implementation Checklist

### Dark Mode
- [ ] Create ThemeContext
- [ ] Create useTheme hook
- [ ] Add theme.css with all color variables
- [ ] Update all component CSS to use variables
- [ ] Test on all pages
- [ ] Add to Header

### Reading Stats
- [ ] Create database tables
- [ ] Create backend service
- [ ] Create controllers
- [ ] Create frontend components
- [ ] Add API endpoints
- [ ] Add to navigation
- [ ] Create test data

### Notes & Highlights
- [ ] Create database tables
- [ ] Create backend models
- [ ] Create API endpoints
- [ ] Create HighlightBar component
- [ ] Create NotesPanel component
- [ ] Integrate with Reading.jsx
- [ ] Add styling
- [ ] Test functionality

---

## 🚀 Deployment Order

1. **Week 1:** Dark mode (quick win, improves everything)
2. **Week 2:** Reading stats (engagement booster)
3. **Week 3:** Notes & highlights (professional feature)

After this, you'll have a professional, feature-rich e-library app! 📚

