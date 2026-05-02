# 📚 AI-Powered E-Library System

An intelligent, cross-platform E-Library application that leverages advanced Machine Learning to provide semantic book recommendations and track reading velocity. The system offers a seamless experience across a React Native mobile app and a React web frontend, powered by a robust Node.js backend and a specialized Python AI microservice.

## ✨ Key Features

*   **🔍 AI Semantic Recommendations:** Uses advanced NLP (SentenceTransformers) and FAISS indexing to recommend books based on natural language ideas, not just keyword matching.
*   **📈 Reading Velocity Analyzer:** Tracks user reading sessions to calculate individual reading speed (velocity) and predict exactly when they will finish a book.
*   **📱 Cross-Platform Accessibility:** A fully functional React Native (Expo) mobile application for readers on the go, paired with a React web frontend for broader access.
*   **☁️ Optimized Cloud Infrastructure:** The AI engine uses a lazy-loading architecture to run highly intensive PyTorch models efficiently within cloud memory constraints (Render Free Tier).
*   **🔐 Secure Authentication:** Full user registration and login system featuring secure `bcrypt` password hashing and JWT token-based API protection.
*   **⚡ Real-Time Database Sync:** All reading progress and user data is synced instantly via MongoDB Atlas across both the web and mobile platforms.

## 🛠️ Technology Stack

*   **Mobile App:** React Native, Expo, Tailwind CSS
*   **Web Frontend:** React.js, Tailwind CSS, Capacitor
*   **Main Backend:** Node.js, Express.js
*   **AI Microservice:** Python, Flask, Gunicorn
*   **Machine Learning:** PyTorch (CPU optimized), SentenceTransformers (`all-MiniLM-L6-v2`), FAISS Vector Search, Pandas
*   **Database:** MongoDB Atlas
*   **Deployment:** Render (Cloud Hosting), EAS (Expo Application Services)

## 📁 Project Structure

```text
E-Library/
├── Python-ranker/            # Python AI Microservice
│   ├── mobile_app.py         # Flask API & Lazy-loading AI Manager
│   ├── reading_velocity.py   # Reading speed calculation algorithms
│   ├── shrink_dataset.py     # Data optimization script
│   └── requirements.txt      # PyTorch and AI dependencies
├── mobile-backend/           # Node.js Main Backend
│   ├── server.js             # Core Express.js setup and routing
│   ├── routes/               # API endpoints (aiRoutes, authRoutes)
│   ├── middleware/           # JWT Authentication guards
│   └── .env                  # Database and API configurations
├── mobile-app/               # React Native (Expo) Mobile App
│   ├── src/                  
│   │   ├── screens/          # UI Screens (Reader, Profile, Bookshelf)
│   │   ├── config/api.js     # Cloud API integration links
│   │   └── context/          # React Context state management
│   └── eas.json              # Cloud APK build configurations
└── frontend/                 # React Web Application
    ├── src/                  # Web UI Components
    ├── android/              # Capacitor Android wrapper
    └── build_android.bat     # Local Web-to-APK build script
```

## 🚀 Getting Started

To run the full infrastructure locally, you need to start the components in this order:

1.  **Python AI Engine:** 
    Navigate to `Python-ranker/` and run `python mobile_app.py` (Runs on port 5001).
2.  **Node.js Backend:** 
    Navigate to `mobile-backend/`, configure your `.env` with your `MONGODB_URI` and `PYTHON_AI_URL`, and run `npm run dev` (Runs on port 4000).
3.  **Mobile App:** 
    Navigate to `mobile-app/` and run `npx expo start` to open the app on your emulator or physical device.

## 🔒 Security Notes

*   All sensitive environment variables (such as `MONGODB_URI` and `JWT_SECRET`) are strictly excluded from version control via `.gitignore`.
*   User passwords are never stored in plain text and are salted/hashed using `bcrypt`.
*   The Node.js backend acts as a secure proxy to the Python AI Engine, hiding internal API routes from public frontend access.

## 🤝 Contributing

When contributing, please ensure that you test cross-platform compatibility. If you are modifying the AI Engine (`Python-ranker`), you must run the `shrink_dataset.py` script to ensure FAISS indices do not exceed the 512MB RAM cloud deployment limit before committing.
