import { API_BASE_URL } from '../config/ApiConfig';

export const paymentService = {
  createCheckoutSession: async (userId, planType) => {
    const res = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
    return data; // { url, sessionId }
  },

  confirmPayment: async (sessionId) => {
    const res = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data; // { isPremium, subscriptionPlan, premiumExpiresAt, userId }
  },

  getSubscriptionStatus: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/payments/status/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch status');
    return data;
  },

  cancelSubscription: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/payments/cancel/${userId}`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
    return data;
  },

  getPaymentHistory: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/payments/history/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
    return data;
  },
};

export default paymentService;
