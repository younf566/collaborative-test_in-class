import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function LoadingScreen({ onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  const fullText = "I want to create a world where our invisible boundaries become visible.";
  
  useEffect(() => {
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Wait a moment, then fade out and signal completion
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 800); // Fade duration
        }, 1200);
      }
    }, 40); // Typing speed
    
    return () => clearInterval(typeInterval);
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: isComplete ? 0 : 1,
      transition: 'opacity 0.8s ease-out',
      pointerEvents: isComplete ? 'none' : 'all'
    }}>
      <div style={{
        maxWidth: '800px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '32px',
          fontWeight: '300',
          color: '#000000',
          lineHeight: '1.6',
          margin: 0,
          letterSpacing: '0.5px'
        }}>
          {displayedText}
          <span style={{
            opacity: displayedText.length < fullText.length ? 1 : 0,
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}>|</span>
        </p>
      </div>
      
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

LoadingScreen.propTypes = {
  onComplete: PropTypes.func.isRequired
};
