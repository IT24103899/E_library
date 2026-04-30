import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/ApiConfig';
import styles from './PaymentModal.module.css';

const PLANS = {
  monthly: {
    label: 'Monthly',
    price: '$9.99',
    period: '/mo',
    features: ['Unlimited Books', 'Advanced AI Search', 'Offline Reading', 'Personalised Recommendations'],
  },
  annual: {
    label: 'Annual',
    price: '$79.99',
    period: '/yr',
    badge: 'SAVE 33%',
    features: ['Everything in Monthly', 'Priority Support', 'Early Access to New Books', 'Exclusive Scholar Badge'],
  },
};

const PaymentModal = ({ isOpen, onClose, onShowSuccess }) => {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState('annual');
  const [formData, setFormData] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({ cardNumber: '', expiry: '', cvc: '', name: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      formatted = digits.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    } else if (name === 'cvc') {
      formatted = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: formatted }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Cardholder name is required';
    if (formData.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit card number';
    const [mm, yy] = (formData.expiry || '').split('/');
    const now = new Date();
    const expMonth = parseInt(mm, 10);
    const expYear = parseInt('20' + yy, 10);
    if (!mm || !yy || expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      e.expiry = 'Invalid or expired date';
    }
    if (formData.cvc.length < 3) e.cvc = 'Invalid CVC';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStep(3);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser) {
      try {
        const response = await fetch(`${getApiUrl()}/auth/upgrade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUser.id }),
        });
        if (response.ok) {
          const updatedUser = await response.json();
          updatedUser.isPremium = true;
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
        } else {
          throw new Error('Backend upgrade failed');
        }
      } catch (err) {
        authUser.isPremium = true;
        localStorage.setItem('authUser', JSON.stringify(authUser));
      }
    }

    onShowSuccess();
    onClose();
  };

  const selectedPlan = PLANS[plan];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Step indicator */}
        {step < 3 && (
          <div className={styles.steps}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''}`}>
              <span>1</span><label>Plan</label>
            </div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineFill : ''}`} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`}>
              <span>2</span><label>Payment</label>
            </div>
          </div>
        )}

        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* ── STEP 1: Plan ── */}
        {step === 1 && (
          <div className={styles.content}>
            <div className={styles.headerBadge}>💎 PREMIUM SCHOLAR</div>
            <h2 className={styles.title}>Unlock the Full Library</h2>
            <p className={styles.subtitle}>Choose the plan that fits your learning journey.</p>

            <div className={styles.plansRow}>
              {Object.entries(PLANS).map(([key, p]) => (
                <div
                  key={key}
                  className={`${styles.planCard} ${plan === key ? styles.planCardActive : ''}`}
                  onClick={() => setPlan(key)}
                >
                  {p.badge && <div className={styles.planBadge}>{p.badge}</div>}
                  <div className={styles.planRadio}>
                    <div className={`${styles.radioCircle} ${plan === key ? styles.radioChecked : ''}`} />
                    <span className={styles.planLabel}>{p.label}</span>
                  </div>
                  <div className={styles.planPrice}>
                    {p.price}<span className={styles.planPeriod}>{p.period}</span>
                  </div>
                  <ul className={styles.featureList}>
                    {p.features.map(f => (
                      <li key={f}><span className={styles.checkIcon}>✓</span>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              You'll be charged <strong>{selectedPlan.price}</strong>{selectedPlan.period} — cancel anytime.
            </div>

            <button className={styles.primaryBtn} onClick={() => setStep(2)}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* ── STEP 2: Payment form ── */}
        {step === 2 && (
          <div className={styles.content}>
            <button className={styles.backLink} onClick={() => setStep(1)}>← Back</button>
            <h2 className={styles.title}>Secure Checkout</h2>
            <p className={styles.subtitle}>
              {selectedPlan.label} plan — <strong>{selectedPlan.price}{selectedPlan.period}</strong>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  autoComplete="cc-name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? styles.inputError : ''}
                />
                {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label>Card Number</label>
                <div className={styles.cardNumberWrap}>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={errors.cardNumber ? styles.inputError : ''}
                  />
                  <span className={styles.cardIcon}>💳</span>
                </div>
                {errors.cardNumber && <span className={styles.errMsg}>{errors.cardNumber}</span>}
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Expiry</label>
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    maxLength="5"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    className={errors.expiry ? styles.inputError : ''}
                  />
                  {errors.expiry && <span className={styles.errMsg}>{errors.expiry}</span>}
                </div>
                <div className={styles.field}>
                  <label>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    placeholder="123"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength="3"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    className={errors.cvc ? styles.inputError : ''}
                  />
                  {errors.cvc && <span className={styles.errMsg}>{errors.cvc}</span>}
                </div>
              </div>

              <div className={styles.secureRow}>
                <span>🔒</span>
                <span>256-bit SSL encrypted · Simulation only · No real charge</span>
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Pay {selectedPlan.price} & Upgrade
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: Processing ── */}
        {step === 3 && (
          <div className={styles.processing}>
            <div className={styles.spinner} />
            <h2 className={styles.processingTitle}>Processing Payment…</h2>
            <p className={styles.processingSubtitle}>Activating your Premium Scholar access. Please wait.</p>
            <div className={styles.processingSteps}>
              <div className={styles.pStep}><span className={styles.pDot} />Verifying card details</div>
              <div className={styles.pStep}><span className={styles.pDot} />Contacting payment network</div>
              <div className={styles.pStep}><span className={styles.pDot} />Activating premium access</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;
