import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ForceLogout = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log('Force logout initiated...');
        localStorage.removeItem('authUser');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('app-theme'); // Optional, to reset theme too
        
        // Short delay to ensure localStorage is cleared
        const timer = setTimeout(() => {
            navigate('/start');
            window.location.reload(); // Hard reload to clear any memory state
        }, 500);
        
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ 
            background: '#020617', 
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#ef4444' 
        }}>
            <h2 style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>Terminating Session...</h2>
            <p style={{ marginTop: '1rem', opacity: 0.6 }}>Cleaning up local registry</p>
        </div>
    );
};

export default ForceLogout;
