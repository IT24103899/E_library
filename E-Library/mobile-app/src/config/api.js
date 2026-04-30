import { Platform } from 'react-native';

// Live Render Backend (Active)
export const API_BASE_URL = `https://mobile-backend-new.onrender.com/api/`;

// AI Engine URL (Proxied through Node.js)
export const PYTHON_API_URL = `${API_BASE_URL}ai/`;

// Local Backend (Backup for development)
// const LOCAL_IP = '10.0.2.2'; // Standard Android Emulator IP
// const LOCAL_IP = '192.168.8.102'; // PC Wi-Fi IP
// export const API_BASE_URL = `http://${LOCAL_IP}:4000/api/`;

