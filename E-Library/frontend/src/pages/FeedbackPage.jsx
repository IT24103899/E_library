import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeedbackPage.module.css';
import FeedbackService from '../services/FeedbackService';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarMistakes, setGrammarMistakes] = useState([]);
  const [grammarChecked, setGrammarChecked] = useState(false);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setGrammarChecked(false);
    setGrammarMistakes([]);
  };

  const handleCheckGrammar = async () => {
    if (!message.trim()) return;
    setIsCheckingGrammar(true);
    setGrammarChecked(false);
    setGrammarMistakes([]);
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
      
      const mistakes = (data.matches || []).map(m => ({
        offset: m.offset,
        length: m.length,
        mistake: message.substring(m.offset, m.offset + m.length),
        message: m.message,
        suggestions: m.replacements.map(r => r.value).slice(0, 5)
      }));

      setGrammarMistakes(mistakes);
      setGrammarChecked(true);
      if (mistakes.length === 0) {
        setErrorMessage('✓ Your report is clearly articulated and ready for submission.');
      }
    } catch (err) {
      console.error('Error calling grammar API:', err);
      setErrorMessage('Report analysis could not be completed at this time.');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const applyCorrection = (mistake, suggestion) => {
    const newMsg = message.substring(0, mistake.offset) + suggestion + message.substring(mistake.offset + mistake.length);
    setMessage(newMsg);
    
    const offsetDiff = suggestion.length - mistake.length;
    setGrammarMistakes(prev => prev.filter(m => m !== mistake).map(m => {
        if (m.offset > mistake.offset) {
            return { ...m, offset: m.offset + offsetDiff };
        }
        return m;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please describe the issue before transmitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await FeedbackService.submitFeedback({
        type: 'bug',
        rating: null,
        message
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      setErrorMessage('Failed to transmit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {!isSuccess ? (
          <>
            <section className={styles.heroSection}>
              <h1 className={styles.title}>Incident Reporting</h1>
              <p className={styles.subtitle}>Encountered friction? Document the anomaly below. Our architects will prioritize its resolution.</p>
            </section>

            <div className={styles.formSection}>
              <form onSubmit={handleSubmit}>
                <div className={styles.inputHeader}>
                  <span className={styles.sectionLabel}>Detailed Description</span>
                  <div className={styles.grammarControls}>
                    <button 
                      type="button" 
                      className={styles.grammarBtn}
                      onClick={handleCheckGrammar}
                      disabled={isCheckingGrammar || !message.trim()}
                    >
                      {isCheckingGrammar ? 'ANALYZING...' : '✨ ANALYZE REPORT'}
                    </button>
                  </div>
                </div>
                
                <div className={styles.inputSection}>
                    <textarea
                    className={styles.textarea}
                    placeholder="Describe the friction or anomaly you encountered in detail..."
                    value={message}
                    onChange={handleMessageChange}
                    maxLength={1000}
                    required
                    />
                    <div className={styles.charCounter}>{message.length} / 1000</div>
                </div>

                {grammarChecked && grammarMistakes.length > 0 && (
                  <div className={styles.grammarResults}>
                    <h4>Clarification Needed ({grammarMistakes.length})</h4>
                    <div className={styles.mistakeCarousel}>
                      {grammarMistakes.map((mistake, idx) => (
                        <div key={idx} className={styles.grammarMistake}>
                          <div className={styles.mistakeHeader}>
                            <span className={styles.mistakeLabel}>Detection:</span>
                            <span className={styles.mistakeText}>"{mistake.mistake}"</span>
                          </div>
                          <div className={styles.mistakeReason}>{mistake.message}</div>
                          {mistake.suggestions && mistake.suggestions.length > 0 && (
                            <div className={styles.suggestionsBox}>
                              {mistake.suggestions.map((sug, i) => (
                                <button 
                                  key={i} 
                                  type="button" 
                                  className={styles.suggestionChip}
                                  onClick={() => applyCorrection(mistake, sug)}
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorMessage && (
                    <div className={`${styles.errorMessage} ${errorMessage.startsWith('✓') ? styles.successAlert : ''}`}>
                        {errorMessage}
                    </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT REPORT'}
                </button>
              </form>
            </div>
          </>
        ) : (
           <div className={styles.successMessage}>
              <div className={styles.checkIcon}>✓</div>
              <h2 className={styles.title}>Report Transmitted</h2>
              <p className={styles.subtitle}>Your detailed observation has been securely logged. Our team is now analyzing the anomaly.</p>
              <button className={styles.homeBtn} onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
