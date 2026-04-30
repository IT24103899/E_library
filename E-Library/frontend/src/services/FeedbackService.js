import axios from 'axios';
import { API_BASE_URL } from '../config/ApiConfig';

const API_URL = `${API_BASE_URL}/v1/feedback`;

const FeedbackService = {
  submitFeedback: async (feedbackData) => {
    try {
      // Create user id from localStorage if available
      const userStr = localStorage.getItem('authUser');
      let userId = null;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj.id || userObj.userId || null;
        } catch (e) {
          console.warn("Could not parse authUser from localStorage", e);
          userId = null;
        }
      }

      // If no userId found, try alternate sources
      if (!userId) {
        // Try from sessionStorage
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
          try {
            const userObj = JSON.parse(sessionUser);
            userId = userObj.id || userObj.userId || null;
          } catch (e) {
            console.warn("Could not parse user from sessionStorage", e);
          }
        }
      }

      // Default to 0 if still no userId (for development/testing)
      if (!userId) {
        console.warn("No userId found, using default value 0");
        userId = 0;
      }

      const payload = {
        ...feedbackData,
        userId: parseInt(userId, 10)
      };

      console.log("Submitting feedback with payload:", payload);
      const response = await axios.post(API_URL, payload);
      return response;
    } catch (error) {
      console.error("Error submitting feedback:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default FeedbackService;
