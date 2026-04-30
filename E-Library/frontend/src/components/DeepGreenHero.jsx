import React from 'react';

const DeepGreenHero = ({ title, highlightTitle, subtitle, children }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #17382d 0%, #0d211a 100%)',
      borderBottomLeftRadius: '60px',
      borderBottomRightRadius: '60px',
      padding: '8rem 2rem 5rem',
      position: 'relative',
      boxShadow: '0 20px 50px rgba(23, 56, 45, 0.2)',
      marginTop: '0',
      zIndex: 10,
      width: '100%',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {/* Subtle Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.03) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.02) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '1300px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 0.8s ease-out both'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          color: 'white'
        }}>
          {title} <span style={{ color: '#fbbf24' }}>{highlightTitle}</span>
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: '#a7f3d0',
            opacity: 0.8,
            maxWidth: '800px',
            marginBottom: '2rem'
          }}>
            {subtitle}
          </p>
        )}

        {children}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DeepGreenHero;
