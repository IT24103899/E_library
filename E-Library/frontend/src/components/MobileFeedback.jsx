import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, MessageCircle, Star } from 'lucide-react';
import styles from './MobileFeedback.module.css';
import FeedbackService from '../services/FeedbackService';

const MobileFeedback = ({ isOpen, onClose }) => {
  const [type, setType] = useState('bug'); // 'bug', 'feature', 'review'
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  // Handle animation entry/exit
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false); // Reset on open
      setMessage(''); // Reset message
      setTimeout(() => setShowSheet(true), 10);
    } else {
      setShowSheet(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowSheet(false);
    setTimeout(() => onClose(), 300); // Wait for transition
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        type,
        rating: type === 'review' ? rating : null,
        message
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (error) {
      console.error('Feedback failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !showSheet) return null;

  return (
    <div className={`${styles.overlay} ${showSheet ? styles.visible : ''}`} onClick={handleClose}>
      <div 
        className={`${styles.bottomSheet} ${showSheet ? styles.slideUp : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.dragHandle} onClick={handleClose}></div>
        
        <div className={styles.header}>
          <h3 className={styles.title}>Send Feedback</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        {isSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <Sparkles size={40} className={styles.successIcon} />
            </div>
            <h4>Thank You!</h4>
            <p>Your feedback helps us improve.</p>
          </div>
        ) : (
          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.typeSelector}>
              <button 
                type="button" 
                className={`${styles.typeBtn} ${type === 'bug' ? styles.activeTypeBug : ''}`}
                onClick={() => setType('bug')}
              >
                <AlertCircle size={18} />
                <span>Issue</span>
              </button>
              <button 
                type="button" 
                className={`${styles.typeBtn} ${type === 'feature' ? styles.activeTypeFeature : ''}`}
                onClick={() => setType('feature')}
              >
                <Sparkles size={18} />
                <span>Idea</span>
              </button>
              <button 
                type="button" 
                className={`${styles.typeBtn} ${type === 'review' ? styles.activeTypeReview : ''}`}
                onClick={() => setType('review')}
              >
                <MessageCircle size={18} />
                <span>Review</span>
              </button>
            </div>

            {type === 'review' && (
              <div className={styles.ratingSection}>
                <p>How would you rate your experience?</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.starBtn} ${rating >= value ? styles.activeStar : ''}`}
                      onClick={() => setRating(value)}
                    >
                      <Star size={28} fill={rating >= value ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.inputWrapper}>
              <textarea
                className={styles.textArea}
                placeholder={
                  type === 'bug' ? "Describe the issue you faced..." :
                  type === 'feature' ? "What new features would you like to see?" :
                  "Tell us what you think about the app..."
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={500}
                required
              />
              <span className={styles.charCount}>{message.length}/500</span>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isSubmitting || !message.trim() || (type === 'review' && rating === 0)}
            >
              {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MobileFeedback;
