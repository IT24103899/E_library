import React, { useState, useEffect } from 'react';
import styles from './FeedbackWidget.module.css';
import FeedbackService from '../services/FeedbackService';

const FeedbackWidget = ({ isOpen, onClose }) => {
  const [type, setType] = useState('bug'); // 'bug', 'feature', 'review'
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setMessage('');
      setRating(0);
      setType('bug');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    if (selectedType !== 'review') {
      setRating(0);
    }
  };

  const handleCheckGrammar = async () => {
    if (!message.trim()) {
      setErrorMessage('Please enter text to check');
      return;
    }

    setIsCheckingGrammar(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.append('text', message);
      params.append('language', 'en-US');

      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      const data = await response.json();
      const mistakes = data.matches || [];
      
      if (mistakes.length === 0) {
        setErrorMessage('✓ No grammar issues found! Your message is perfectly balanced.');
      } else {
        setErrorMessage(`Found ${mistakes.length} point(s) for refinement.`);
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setErrorMessage('Harmony check could not be completed at this time.');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Your thought is empty. Please share your feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await FeedbackService.submitFeedback({
        type,
        rating: type === 'review' ? rating : null,
        message
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data || 
                       error.message || 
                       'Failed to transmit feedback. Please try again.';
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : 'Feedback transmission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Hub">✕</button>
        
        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <h3 className={styles.title}>Feedback Hub</h3>
              <p className={styles.subtitle}>Collaborate with us to refine the Sanctuary experience.</p>
            </div>

            <div className={styles.typeSelector}>
              <div
                className={`${styles.typeCard} ${type === 'bug' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('bug')}
              >
                <span className={styles.typeIcon}>🐛</span>
                <span className={styles.typeName}>Reports</span>
              </div>
              <div
                className={`${styles.typeCard} ${type === 'feature' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('feature')}
              >
                <span className={styles.typeIcon}>💡</span>
                <span className={styles.typeName}>Aspirations</span>
              </div>
              <div
                className={`${styles.typeCard} ${type === 'review' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('review')}
              >
                <span className={styles.typeIcon}>✨</span>
                <span className={styles.typeName}>Reflection</span>
              </div>
            </div>

            {type === 'review' && (
              <div className={styles.ratingSection}>
                <div className={styles.stars} onMouseLeave={() => setHoveredStar(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`${styles.star} ${(hoveredStar || rating) >= value ? styles.filled : ''}`}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredStar(value)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.textarea}
                  placeholder={
                    type === 'bug' ? "Describe the friction you encountered..." :
                    type === 'feature' ? "What additions would enrich the sanctuary?" :
                    "Share your experience with our library..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  required
                />
                <div className={styles.charCounter}>{message.length} / 500</div>
              </div>
              
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleCheckGrammar}
                  className={styles.grammarBtn}
                  disabled={isCheckingGrammar || !message.trim()}
                >
                  {isCheckingGrammar ? 'REFINING...' : '✨ HARMONY CHECK'}
                </button>
                
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isSubmitting || !message.trim() || (type === 'review' && rating === 0)}
                >
                  {isSubmitting ? 'SENDING...' : 'TRANSMIT'}
                </button>
              </div>

              {errorMessage && (
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}
            </form>
          </>
        ) : (
           <div className={styles.successState}>
              <div className={styles.checkIcon}>✓</div>
              <h3 className={styles.title}>Grateful</h3>
              <p className={styles.subtitle}>Your feedback has been successfully woven into our future.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;
