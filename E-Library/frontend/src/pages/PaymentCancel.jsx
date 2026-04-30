import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h2 style={{ color: '#f8fafc', fontSize: 24, margin: 0 }}>Payment Cancelled</h2>
        <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>
          No charge was made. You can restart at any time.
        </p>
        <button
          onClick={() => navigate('/payment')}
          style={{
            marginTop: 28,
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '13px 28px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          View Plans Again
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 12,
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '12px 28px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
