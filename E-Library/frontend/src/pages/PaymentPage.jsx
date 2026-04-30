import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, CreditCard, Lock, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/ApiConfig';

const PLANS = [
  {
    id: 'MONTHLY',
    label: 'Monthly Pass',
    price: '$4.99',
    period: '/month',
    features: ['Unlimited Access', 'Ad-free Reading', 'Basic AI Recs'],
    color: '#3b82f6'
  },
  {
    id: 'YEARLY',
    label: 'Annual Premium',
    price: '$39.99',
    period: '/year',
    features: ['Everything in Monthly', 'Save 33% Annually', 'Advanced AI features', 'Premium Badge'],
    color: '#8b5cf6',
    popular: true
  }
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchStatus(parsed.id);
    }
  }, []);

  async function fetchStatus(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/status/${userId}`);
      if (res.ok) setStatus(await res.json());
    } catch {
      // ignore
    }
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    else return value;
  };

  const formatExpiry = (value) => {
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !name) {
      alert("Please fill in all payment details to proceed.");
      return;
    }
    
    setProcessing(true);
    
    // Simulate a secure payment process
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Update local storage securely to reflect mock successful payment
      if (user) {
        const updatedUser = { 
          ...user, 
          isPremium: true, 
          subscriptionPlan: selectedPlan.id,
          premiumExpiresAt: new Date(Date.now() + (selectedPlan.id === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }
      
      // Notify backend if needed (optional for mock, but good for completeness)
      fetch(`${API_BASE_URL}/auth/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      }).catch(() => {});

      setTimeout(() => {
        navigate('/books');
      }, 2500);
      
    }, 2500);
  };

  const isPremiumActive = status?.isPremium;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#030712',
      color: '#f9fafb',
      fontFamily: '"Inter", system-ui, sans-serif'
    }}>
      {/* Left Panel: Plan Selection */}
      <div style={{
        flex: 1,
        padding: '3rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center',
            gap: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '0.9rem', marginBottom: '3rem',
            padding: '0.5rem', borderRadius: '0.5rem', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none'; }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 1rem 0', backgroundImage: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Elevate Your Experience
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>
            Gain unlimited access to our entire literary collection and exclusive AI-powered insights.
          </p>
        </div>

        {isPremiumActive && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem',
            borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem',
            color: '#4ade80'
          }}>
            <CheckCircle2 />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Active Subscription found</p>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>You are already enjoying premium benefits.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {PLANS.map(plan => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: `2px solid ${isSelected ? plan.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '1.25rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden', transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: plan.color, color: '#fff', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: '700', borderBottomLeftRadius: '1rem' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{plan.label}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '800' }}>{plan.price}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{plan.period}</span>
                    </div>
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? plan.color : '#4b5563'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: plan.color }} />}
                  </div>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                      <CheckCircle2 size={16} color={plan.color} /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.85rem', marginTop: 'auto', paddingTop: '2rem' }}>
          <ShieldCheck size={16} /> Secure Mock Payment Gateway for Demonstration purposes.
        </div>
      </div>

      {/* Right Panel: Payment Form */}
      <div style={{
        flex: 1, padding: '3rem 4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.0) 100%)',
        position: 'relative'
      }}>
        <div style={{
          width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          borderRadius: '2rem', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Payment Details</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: 40, height: 26, background: '#1f2937', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 12, fontStyle: 'italic' }}>VISA</span></div>
              <div style={{ width: 40, height: 26, background: '#1f2937', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex' }}><div style={{ width: 14, height: 14, background: '#ef4444', borderRadius: '50%' }} /><div style={{ width: 14, height: 14, background: '#f59e0b', borderRadius: '50%', marginLeft: -6 }} /></div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>Cardholder Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="John Doe"
                style={{
                  width: '100%', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = `1px solid ${selectedPlan.color}`}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>Card Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} required
                  placeholder="0000 0000 0000 0000" maxLength="19"
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', paddingRight: '3rem',
                    boxSizing: 'border-box', letterSpacing: '2px'
                  }}
                  onFocus={(e) => e.target.style.border = `1px solid ${selectedPlan.color}`}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
                <CreditCard size={20} color="#6b7280" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>Expiry Date</label>
                <input 
                  type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} required
                  placeholder="MM/YY" maxLength="5"
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.border = `1px solid ${selectedPlan.color}`}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>CVC/CVV</label>
                <input 
                  type="password" value={cvc} onChange={e => setCvc(e.target.value.replace(/[^0-9]/g, ''))} required
                  placeholder="•••" maxLength="4"
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box', letterSpacing: '4px'
                  }}
                  onFocus={(e) => e.target.style.border = `1px solid ${selectedPlan.color}`}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={processing || success}
                style={{
                  width: '100%', padding: '1.25rem', borderRadius: '0.75rem', border: 'none',
                  background: success ? '#10b981' : selectedPlan.color, color: '#fff', fontSize: '1.1rem', fontWeight: '600',
                  cursor: (processing || success) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.3s', boxShadow: success ? '0 0 20px rgba(16, 185, 129, 0.4)' : `0 10px 25px -5px ${selectedPlan.color}66`
                }}
              >
                {success ? (
                  <> <CheckCircle2 /> Payment Successful! </>
                ) : processing ? (
                  <> <Loader2 className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing... </>
                ) : (
                  <> <Lock size={18} /> Pay {selectedPlan.price} </>
                )}
              </button>
            </div>
            
            <p style={{ textAlign: 'center', margin: 0, fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
              By confirming, you agree to our Terms of Service.
            </p>
          </form>
          
          {/* Overlay for success state */}
          {success && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.8)',
              backdropFilter: 'blur(8px)', borderRadius: '2rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#fff', animation: 'fadeIn 0.5s ease'
            }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                 <CheckCircle2 size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Welcome to Premium</h3>
              <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '80%' }}>
                Your payment was successful. Redirecting to your enhanced library...
              </p>
            </div>
          )}
          
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      </div>
    </div>
  );
}
