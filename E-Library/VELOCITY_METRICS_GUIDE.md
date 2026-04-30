# Reading Velocity & Analytics System
## AI-Powered Reading Metrics & Completion Tracking

---

## 📊 Overview

The **Reading Velocity Engine** now tracks with **seconds-level precision**:
- **Pages per hour (pph)** - your exact reading speed
- **Time to complete books** - estimated completion dates with days, hours, minutes, seconds
- **Reading heatmap** - daily activity visualization with formatted times
- **Reading streaks** - consecutive reading sessions
- **Comprehensive statistics** - overall reading performance with precise time breakdowns

**NEW:** All time periods now display in human-readable format (e.g., "2h 23m" instead of "2.38 hours")

---

## 🚀 API Endpoints

### 1. Log Reading Session
**Endpoint:** `POST /api/velocity/log-session`

**Purpose:** Record a reading session with pages read, duration, and timestamps

**Request Body:**
```json
{
  "userId": 20,
  "bookId": 683,
  "pagesRead": 25,
  "durationSeconds": 2700
}
```

**Response:**
```json
{
  "status": "success",
  "session": {
    "user_id": 20,
    "book_id": 683,
    "pages_read": 25,
    "duration_seconds": 2700,
    "duration_formatted": {
      "total_seconds": 2700,
      "formatted": "45m"
    },
    "session_start": "2026-04-02T09:45:00",
    "session_end": "2026-04-02T10:30:00",
    "session_date": "2026-04-02",
    "time_of_day": "morning",
    "velocity_pph": 33.33,
    "timestamp": "2026-04-02T10:30:00"
  }
}
```

**🕐 Timestamps Explained:**
- `session_start` - When reading session began
- `session_end` - When reading session completed
- `session_date` - Date of the session (YYYY-MM-DD)
- `time_of_day` - Category (morning, afternoon, evening, night)
  - Morning: 5:00 AM - 12:00 PM
  - Afternoon: 12:00 PM - 5:00 PM
  - Evening: 5:00 PM - 9:00 PM
  - Night: 9:00 PM - 5:00 AM

---

### 2. Calculate Velocity Metrics
**Endpoint:** `GET /api/velocity/calculate/<user_id>/<book_id>`

**Purpose:** Get aggregated velocity metrics for a user-book pair

**Example:** `GET /api/velocity/calculate/20/683`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "book_id": 683,
    "average_velocity_pph": 34.83,
    "max_velocity_pph": 36.0,
    "min_velocity_pph": 33.33,
    "total_pages_read": 83,
    "total_reading_time": {
      "total_seconds": 8580,
      "days": 0,
      "hours": 2,
      "minutes": 23,
      "seconds": 0,
      "formatted": "2h 23m",
      "total_minutes": 143.0,
      "total_hours": 2.38
    },
    "session_count": 3
  }
}
```

**Metrics Explained:**
- `average_velocity_pph` - Average reading speed across all sessions (pages/hour)
- `max_velocity_pph` - Fastest reading speed achieved
- `min_velocity_pph` - Slowest reading speed recorded
- `total_reading_time` - Total time with formatted display (e.g., "2h 23m")
- `total_pages_read` - Cumulative pages read for this book

---

### 3. Estimate Completion Time
**Endpoint:** `POST /api/velocity/estimate-completion`

**Purpose:** Predict when a book will be completed based on current velocity

**Request Body:**
```json
{
  "userId": 20,
  "bookId": 683,
  "totalPages": 280,
  "currentPage": 36
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "book_id": 683,
    "pages_remaining": 244,
    "current_page": 36,
    "total_pages": 280,
    "progress_percent": 12.86,
    "average_velocity_pph": 34.83,
    "estimated_time": {
      "total_seconds": 25194,
      "days": 0,
      "hours": 7,
      "minutes": 0,
      "seconds": 19,
      "formatted": "7h 19s",
      "total_minutes": 419.9,
      "total_hours": 7.01
    },
    "estimated_completion_date": "2026-04-03T00:31:19.255463",
    "status": "in_progress"
  }
}
```

**Metrics Explained:**
- `progress_percent` - Current completion percentage
- `estimated_time` - Time remaining with human-readable format (e.g., "7h 19s")
- `estimated_completion_date` - Expected completion timestamp
- `pages_remaining` - Number of pages left to read

---

### 4. Get Reading Heatmap
**Endpoint:** `GET /api/velocity/heatmap/<user_id>?days=28`

**Purpose:** Generate a daily activity heatmap for the past N days with time tracking

**Example:** `GET /api/velocity/heatmap/20?days=28`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "days_analyzed": 28,
    "active_days": 5,
    "total_sessions": 8,
    "heatmap": {
      "2026-03-05": {
        "sessions": 0,
        "total_pages": 0,
        "total_seconds": 0,
        "average_velocity": 0,
        "total_time_formatted": {
          "formatted": "0s",
          "total_minutes": 0.0,
          "total_hours": 0.0
        }
      },
      "2026-03-06": {
        "sessions": 2,
        "total_pages": 55,
        "total_seconds": 5400,
        "average_velocity": 36.67,
        "total_time_formatted": {
          "total_seconds": 5400,
          "days": 0,
          "hours": 1,
          "minutes": 30,
          "seconds": 0,
          "formatted": "1h 30m",
          "total_minutes": 90.0,
          "total_hours": 1.5
        }
      }
    }
  }
}
```

**Heatmap Metrics:**
- `sessions` - Number of reading sessions on that day
- `total_pages` - Pages read on that day
- `total_seconds` - Total time in seconds
- `total_time_formatted` - Human-readable format (e.g., "1h 30m")
- `average_velocity` - Pages per hour for that day

---

### 5. Get User Reading Statistics
**Endpoint:** `GET /api/velocity/user-stats/<user_id>`

**Purpose:** Get comprehensive reading statistics for a user with precise time tracking

**Example:** `GET /api/velocity/user-stats/20`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "total_pages_read": 158,
    "total_reading_time": {
      "total_seconds": 15480,
      "days": 0,
      "hours": 4,
      "minutes": 18,
      "seconds": 0,
      "formatted": "4h 18m",
      "total_minutes": 258.0,
      "total_hours": 4.3
    },
    "session_count": 5,
    "books_being_read": 2,
    "average_velocity_pph": 36.74,
    "max_velocity_pph": 40.0,
    "min_velocity_pph": 33.33,
    "current_streak_days": 1,
    "last_reading_session": "2026-04-02T17:30:59.616780"
  }
}
```

**Statistics Explained:**
- `total_pages_read` - Cumulative pages across all books
- `total_reading_time` - Total time with breakdown (days, hours, minutes, seconds)
- `session_count` - Total number of reading sessions
- `books_being_read` - Number of books currently being read
- `average_velocity_pph` - Overall average reading speed
- `current_streak_days` - Current consecutive reading streak

---

### 6. Get Time of Day Analytics (NEW!)
**Endpoint:** `GET /api/velocity/time-of-day/<user_id>`

**Purpose:** Analyze reading patterns by time of day to find best reading time

**Example:** `GET /api/velocity/time-of-day/20`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "best_reading_time": "evening",
    "best_velocity_at_time": 37.78,
    "time_of_day_analysis": {
      "morning": {
        "sessions": 1,
        "pages_read": 25,
        "total_time": {
          "formatted": "45m",
          "total_hours": 0.75
        },
        "average_velocity_pph": 33.33,
        "best_velocity_pph": 33.33,
        "worst_velocity_pph": 33.33
      },
      "afternoon": {
        "sessions": 1,
        "pages_read": 30,
        "total_time": {
          "formatted": "50m",
          "total_hours": 0.83
        },
        "average_velocity_pph": 36.0,
        "best_velocity_pph": 36.0,
        "worst_velocity_pph": 36.0
      },
      "evening": {
        "sessions": 2,
        "pages_read": 68,
        "total_time": {
          "formatted": "1h 48m",
          "total_hours": 1.8
        },
        "average_velocity_pph": 37.78,
        "best_velocity_pph": 40.0,
        "worst_velocity_pph": 35.0
      },
      "night": {
        "sessions": 0,
        "pages_read": 0,
        "total_time": {"formatted": "0s"},
        "average_velocity_pph": 0
      }
    }
  }
}
```

**🕐 Insights:**
- **Best reading time** - Time of day with highest velocity
- **Sessions per time** - How many times you read in each period
- **Total time per period** - Complete time breakdown
- **Velocity comparison** - See when you read fastest

---

### 7. Get Session Timeline (NEW!)
**Endpoint:** `GET /api/velocity/timeline/<user_id>` or `GET /api/velocity/timeline/<user_id>/<book_id>`

**Purpose:** Get chronological list of all reading sessions with exact timestamps

**Example:** `GET /api/velocity/timeline/20/683`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 20,
    "total_sessions": 3,
    "book_filter": 683,
    "first_session": "2026-04-02T09:45:00",
    "last_session": "2026-04-02T19:45:00",
    "timeline": [
      {
        "book_id": 683,
        "session_date": "2026-04-02",
        "session_start": "2026-04-02T09:45:00",
        "session_end": "2026-04-02T10:30:00",
        "time_of_day": "morning",
        "duration": {
          "formatted": "45m"
        },
        "pages_read": 25,
        "velocity_pph": 33.33
      },
      {
        "book_id": 683,
        "session_date": "2026-04-02",
        "session_start": "2026-04-02T14:00:00",
        "session_end": "2026-04-02T14:50:00",
        "time_of_day": "afternoon",
        "duration": {
          "formatted": "50m"
        },
        "pages_read": 30,
        "velocity_pph": 36.0
      },
      {
        "book_id": 683,
        "session_date": "2026-04-02",
        "session_start": "2026-04-02T19:00:00",
        "session_end": "2026-04-02T19:45:00",
        "time_of_day": "evening",
        "duration": {
          "formatted": "45m"
        },
        "pages_read": 28,
        "velocity_pph": 35.0
      }
    ]
  }
}
```

**📅 Timeline Details:**
- **session_start** - Exact start time of reading (ISO 8601)
- **session_end** - Exact end time of reading
- **session_date** - Date in YYYY-MM-DD format
- **Chronological order** - Sessions sorted by start time
- **Time of day** - Morning/afternoon/evening/night category

### Display Reading Velocity with Formatted Time
```jsx
// Component to show reading velocity metrics
const [velocity, setVelocity] = useState(null);

useEffect(() => {
  fetch(`/api/velocity/calculate/${userId}/${bookId}`)
    .then(r => r.json())
    .then(data => setVelocity(data.data));
}, [userId, bookId]);

if (velocity) {
  const timeData = velocity.total_reading_time;
  return (
    <div>
      <h3>⚡ Reading Velocity</h3>
      <p>Average: {velocity.average_velocity_pph} pages/hour</p>
      <p>Max: {velocity.max_velocity_pph} pages/hour</p>
      <p>Total time: {timeData.formatted} ({timeData.total_hours.toFixed(2)} hours)</p>
      <p>Sessions: {velocity.session_count}</p>
    </div>
  );
}
```

### Display Completion Estimate with Readable Time
```jsx
const [estimate, setEstimate] = useState(null);

useEffect(() => {
  fetch('/api/velocity/estimate-completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      bookId,
      totalPages,
      currentPage
    })
  })
    .then(r => r.json())
    .then(data => setEstimate(data.data));
}, [userId, bookId, totalPages, currentPage]);

if (estimate) {
  const timeData = estimate.estimated_time;
  const finishDate = new Date(estimate.estimated_completion_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div>
      <h3>📅 Completion Estimate</h3>
      <p>Progress: {estimate.progress_percent}%</p>
      <p>Pages remaining: {estimate.pages_remaining}</p>
      <p>Est. time: <strong>{timeData.formatted}</strong></p>
      <p>Finish by: {finishDate}</p>
    </div>
  );
}
```

### Log Reading Session with Seconds
```jsx
const handleSessionEnd = async (pagesRead, durationSeconds) => {
  const response = await fetch('/api/velocity/log-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 20,
      bookId: 683,
      pagesRead,
      durationSeconds  // Use seconds, not minutes!
    })
  });
  
  const result = await response.json();
  const session = result.session;
  console.log('Session logged:', session);
  console.log(`Time: ${session.duration_formatted.formatted}`);
  console.log(`Velocity: ${session.velocity_pph} pph`);
};
```

### Display Heatmap with Time Formatting
```jsx
const [heatmap, setHeatmap] = useState(null);

useEffect(() => {
  fetch(`/api/velocity/heatmap/${userId}?days=28`)
    .then(r => r.json())
    .then(data => setHeatmap(data.data));
}, [userId]);

if (heatmap) {
  const dates = Object.keys(heatmap.heatmap).sort();
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
      {dates.map(date => {
        const activity = heatmap.heatmap[date];
        const intensity = activity.sessions > 0 ? activity.sessions / 3 : 0;
        const color = `rgba(139, 92, 246, ${Math.min(intensity, 1)})`;
        const timeStr = activity.total_time_formatted.formatted;
        
        return (
          <div 
            key={date}
            style={{
              backgroundColor: color,
              padding: '10px',
              borderRadius: '6px',
              textAlign: 'center'
            }}
            title={`${date}: ${activity.sessions} sessions, ${activity.total_pages} pages, ${timeStr}`}
          >
            {activity.sessions}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 📱 Workflow

1. **User reads a book** - tracks time (seconds) and pages
2. **End reading session** - POST to `/api/velocity/log-session` with durationSeconds
3. **Calculate velocity** - GET `/api/velocity/calculate/{userId}/{bookId}`
4. **Show completion estimate** - POST to `/api/velocity/estimate-completion`
5. **Display heatmap** - GET `/api/velocity/heatmap/{userId}`
6. **Show user stats** - GET `/api/velocity/user-stats/{userId}`

**Time is tracked in seconds**, but displayed in human-readable format (e.g., "2h 23m 15s")

---

## 🎯 Sample Calculations

**Example User: 20, Book: 683 (Pride and Prejudice - 280 pages)**

### Session Data (all times in seconds):
- Session 1: 25 pages in 2700 seconds (45 min) = **33.33 pph**
- Session 2: 30 pages in 3000 seconds (50 min) = **36.0 pph**  
- Session 3: 28 pages in 2880 seconds (48 min) = **35.0 pph**

### Aggregated Metrics:
- Average velocity: **34.83 pph**
- Total time: **2h 23m** (8,580 seconds = 143 minutes)
- Total pages: **83 pages**

### Completion Estimate (at page 36 of 280):
- Pages remaining: **244 pages**
- At 34.83 pph: **7h 0m 19s** (25,194 seconds)
- Formatted display: **"7h 19s"**
- Estimated completion: **Tomorrow at ~12:30 PM**

---

## 🔧 Python Usage

```python
from reading_velocity import ReadingVelocityAnalyzer

analyzer = ReadingVelocityAnalyzer()

# Log sessions (using seconds)
analyzer.log_reading_session(user_id=20, book_id=683, pages_read=25, duration_seconds=2700)  # 45 min
analyzer.log_reading_session(user_id=20, book_id=683, pages_read=30, duration_seconds=3000)  # 50 min

# Calculate velocity
velocity = analyzer.calculate_velocity(20, 683)
print(f"Average velocity: {velocity['average_velocity_pph']} pph")
print(f"Total time: {velocity['total_reading_time']['formatted']}")  # e.g., "2h 23m"

# Estimate completion
estimate = analyzer.estimate_completion(20, 683, total_pages=280, current_page=36)
print(f"Time remaining: {estimate['estimated_time']['formatted']}")  # e.g., "7h 19s"
print(f"Finish by: {estimate['estimated_completion_date']}")

# Get heatmap
heatmap = analyzer.get_reading_heatmap(20, days=28)
print(f"Active days: {heatmap['active_days']}")

# Get stats
stats = analyzer.get_reading_stats(20)
print(f"Total time: {stats['total_reading_time']['formatted']}")  # e.g., "4h 18m"
print(f"Reading streak: {stats['current_streak_days']} days")
```

---

## 🚀 Features

✅ **Seconds-Level Precision** - Track time down to the second for accuracy  
✅ **Human-Readable Time Format** - Display times as "2h 23m 15s" instead of decimal hours  
✅ **Velocity Tracking** - Measures pages per hour with high precision  
✅ **Time Estimation** - Predicts book completion dates with breakdown (days, hours, minutes)  
✅ **Activity Heatmap** - Visualizes reading patterns with daily time tracking  
✅ **Reading Streaks** - Tracks consistency across consecutive sessions  
✅ **Comprehensive Analytics** - Overall reading performance with detailed breakdowns  
✅ **Multi-book Support** - Track multiple books simultaneously  
✅ **AI-Integrated** - Part of the Reading Engine Pro  
✅ **Formatted Responses** - All times include both raw and formatted versions  

---

## 📞 Support

For issues or questions, check:
- `reading_velocity.py` - Core logic
- `app.py` - API endpoints
- Test output for expected formats
