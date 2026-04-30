import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/ApiConfig';
import styles from './PaymentSuccess.module.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [state, setState] = useState(sessionId ? 'loading' : 'success');
  const [info, setInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkVisible, setCheckVisible] = useState(false);
  const canvasRef = useRef(null);

  /* ── read plan name from localStorage ───────────────── */
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('authUser') || '{}'); } catch { return {}; }
  })();
  const planLabel = storedUser.subscriptionPlan === 'ANNUAL' ? 'Annual' : 'Monthly';

  /* ── Stripe confirmation (only when session_id present) ─ */
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment verification failed');
        const stored = localStorage.getItem('authUser');
        if (stored) {
          const user = JSON.parse(stored);
          localStorage.setItem('authUser', JSON.stringify({
            ...user,
            isPremium: data.isPremium,
            subscriptionPlan: data.subscriptionPlan,
            premiumExpiresAt: data.premiumExpiresAt,
          }));
        }
        setInfo(data);
        setState('success');
      } catch (err) {
        setState('error');
        setErrorMsg(err.message);
      }
    })();
  }, []);

  /* ── animate check after mount ───────────────────────── */
  useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(() => setCheckVisible(true), 100);
      return () => clearTimeout(t);
    }
  }, [state]);

  /* ── confetti particles ──────────────────────────────── */
  useEffect(() => {
    if (state !== 'success') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#fbbf24','#f59e0b','#a78bfa','#818cf8','#4ade80','#38bdf8','#fb7185'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2.5,
      vy: 1.5 + Math.random() * 2.5,
      spin: Math.random() * 0.2,
      opacity: 0.9,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.spin += 0.02;
        p.opacity -= 0.003;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
          p.opacity = 0.9;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const expiresAt = (info?.premiumExpiresAt || storedUser.premiumExpiresAt)
    ? new Date(info?.premiumExpiresAt || storedUser.premiumExpiresAt)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      {state === 'success' && (
        <canvas ref={canvasRef} className={styles.confetti} />
      )}

      <div className={styles.card}>

        {/* ── LOADING ── */}
        {state === 'loading' && (
          <div className={styles.loadingSection}>
            <div className={styles.loadingRing}><div /><div /><div /></div>
            <h2 className={styles.loadingTitle}>Verifying your payment…</h2>
            <p className={styles.loadingSub}>Hang tight, this only takes a second.</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {state === 'success' && (
          <>
            {/* Animated check */}
            <div className={`${styles.iconWrap} ${checkVisible ? styles.iconVisible : ''}`}>
              <div className={styles.iconRing}></div>
              <div className={styles.iconRing2}></div>
              <div className={styles.iconCircle}>
                <svg viewBox="0 0 52 52" className={styles.checkSvg}>
                  <circle cx="26" cy="26" r="25" fill="none" className={styles.checkCircle} />
                  <path fill="none" d="M14 27 l8 8 l16-16" className={styles.checkMark} />
                </svg>
              </div>
            </div>

            <div className={styles.badge}>PREMIUM ACTIVATED</div>

            <h1 className={styles.headline}>
              You're all set! 🎉
            </h1>
            <p className={styles.subline}>
              Welcome to <strong>E-Library Premium</strong>.
              Enjoy unlimited access to thousands of books.
            </p>

            {/* Plan summary pill */}
            <div className={styles.planPill}>
              <span className={styles.planPillLabel}>
                ✦ {planLabel === 'Annual' ? 'Annual Plan' : 'Monthly Plan'}
              </span>
              {expiresAt && (
                <span className={styles.planPillExpiry}>Active until {expiresAt}</span>
              )}
            </div>

            {/* Feature highlights */}
            <div className={styles.features}>
              {[
                { icon: '📚', text: 'Unlimited premium books' },
                { icon: '⚡', text: 'Offline reading access' },
                { icon: '🎯', text: 'Personalized recommendations' },
                { icon: '🔖', text: 'Unlimited bookmarks & notes' },
              ].map((f, i) => (
                <div key={i} className={styles.feature} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span className={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <button className={styles.primaryBtn} onClick={() => navigate('/books')}>
              Browse Premium Books
              <span className={styles.btnArrow}>→</span>
            </button>
            <button className={styles.secondaryBtn} onClick={() => navigate('/activity')}>
              Go to My Dashboard
            </button>
          </>
        )}

        {/* ── ERROR ── */}
        {state === 'error' && (
          <div className={styles.errorSection}>
            <div className={styles.errorIcon}>✗</div>
            <h2 className={styles.errorTitle}>Verification Failed</h2>
            <p className={styles.errorMsg}>
              {errorMsg || 'Something went wrong verifying your payment.'}
            </p>
            <p className={styles.errorNote}>
              If your card was charged, please contact support.
            </p>
            <button className={styles.primaryBtn} onClick={() => navigate('/payment')}>
              Back to Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
