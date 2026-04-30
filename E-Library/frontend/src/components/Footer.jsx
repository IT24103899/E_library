import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>📚</div>
          <div>
            <div className={styles.footerText}>E-Library</div>
            <div className={styles.footerText} style={{fontSize:12}}>Organize your reading & track progress</div>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <Link to="/" className={styles.footerLink}>Dashboard</Link>
          <Link to="/books" className={styles.footerLink}>Books</Link>
          <Link to="/about" className={styles.footerLink}>About</Link>
        </div>

        <div className={styles.footerCopy}>© {new Date().getFullYear()} E-Library — All rights reserved</div>
      </div>
    </footer>
  );
};

export default Footer;
