import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ top: '20px', left: '20px' });
  const [isMoving, setIsMoving] = useState(false);
  const noBtnRef = useRef(null);
  const containerRef = useRef(null);

  // Helper to keep values within bounds
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const moveButton = () => {
    if (!noBtnRef.current) return;

    // Get current viewport dimensions accurately
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Get button dimensions
    const rect = noBtnRef.current.getBoundingClientRect();
    const btnWidth = rect.width || 100;
    const btnHeight = rect.height || 50;

    // Safe area boundaries with padding
    const padding = 40;
    const minX = padding;
    const minY = padding;
    const maxX = vw - btnWidth - padding;
    const maxY = vh - btnHeight - padding;

    // Ensure we have room to move
    const safeMaxX = maxX > minX ? maxX : minX;
    const safeMaxY = maxY > minY ? maxY : minY;

    // 1. Initial random position
    let randomX = Math.floor(Math.random() * (safeMaxX - minX)) + minX;
    let randomY = Math.floor(Math.random() * (safeMaxY - minY)) + minY;

    // 2. Center exclusion zone (where Yes and Text are usually located)
    const centerX = vw / 2;
    const centerY = vh / 2;
    const exclusionW = 250;
    const exclusionH = 200;

    if (Math.abs(randomX - centerX) < exclusionW && Math.abs(randomY - centerY) < exclusionH) {
      // Re-adjust if inside the exclusion zone
      randomX = randomX > centerX ?
        clamp(randomX + exclusionW, minX, safeMaxX) :
        clamp(randomX - exclusionW, minX, safeMaxX);

      randomY = randomY > centerY ?
        clamp(randomY + exclusionH, minY, safeMaxY) :
        clamp(randomY - exclusionH, minY, safeMaxY);
    }

    // 3. Final Clamping - Absolute guarantee it's within [min, max]
    const finalX = clamp(randomX, minX, safeMaxX);
    const finalY = clamp(randomY, minY, safeMaxY);

    setNoButtonPos({ top: `${finalY}px`, left: `${finalX}px` });
    setIsMoving(true);
  };

  const handleMouseMove = (e) => {
    if (!noBtnRef.current || isSuccess) return;

    const rect = noBtnRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    // Increased detection radius for a more "challenging" feel
    const distanceThreshold = 180;
    const distance = Math.sqrt(
      Math.pow(mouseX - btnCenterX, 2) + Math.pow(mouseY - btnCenterY, 2)
    );

    if (distance < distanceThreshold) {
      moveButton();
    }
  };

  // Main interaction listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSuccess]);

  // Handle window resize to keep button in view
  useEffect(() => {
    const handleResize = () => {
      if (isMoving && !isSuccess) {
        moveButton();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMoving, isSuccess]);

  const handleYesClick = () => {
    setIsSuccess(true);
  };

  // Background heart/blossom generation
  const [decorations, setDecorations] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const left = Math.random() * 100;
      const size = Math.random() * (35 - 15) + 15;
      const duration = Math.random() * (10 - 5) + 5;
      const type = Math.random() > 0.5 ? '❤' : '🌸';

      setDecorations(prev => [...prev.slice(-30), { id, left, size, duration, type }]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-wrapper">
      <div className="bg-decoration">
        {decorations.map(item => (
          <span
            key={item.id}
            className="floating-item"
            style={{
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
              animationDuration: `${item.duration}s`
            }}
          >
            {item.type}
          </span>
        ))}
      </div>

      <div className="container" ref={containerRef}>
        {!isSuccess ? (
          <>
            <div className="gif-container">
              <img
                src="/question.png"
                alt="Cute Asking"
                onError={(e) => {
                  e.target.src = "https://www.clipartmax.com/png/middle/282-2820517_cute-bear-with-red-love-hearts-1-600%C3%97600-cute-teddy-bears-with.png";
                }}
              />
            </div>
            <h1 className="question-text">Akshara, Will You be My Valentine?</h1>
            <div className="buttons">
              <button
                id="yesBtn"
                className="yes-btn"
                onClick={handleYesClick}
                style={{ position: 'relative', zIndex: 100 }}
              >
                Yes
              </button>
              <button
                ref={noBtnRef}
                id="noBtn"
                className={`no-btn ${isMoving ? 'moving' : ''}`}
                onMouseEnter={moveButton}
                onTouchStart={(e) => {
                  e.preventDefault();
                  moveButton();
                }}
                style={{
                  position: isMoving ? 'fixed' : 'relative',
                  top: noButtonPos.top,
                  left: noButtonPos.left,
                  zIndex: 99,
                  transition: isMoving ? 'all 0.15s ease-out' : 'none'
                }}
              >
                No
              </button>
            </div>
          </>
        ) : (
          <div className="success-content">
            <div className="confetti-container">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#ff4d6d', '#ff85a1', '#ffb3c1', '#ffd6e0'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 4 + 2}s`
                }}></div>
              ))}
            </div>
            <div className="gif-container">
              <img
                src="/success.png"
                alt="Happy Celebration"
                onError={(e) => {
                  e.target.src = "https://i.pinimg.com/originals/f3/d3/1a/f3d31a590a36e0eb098e983416e02927.png";
                }}
              />
            </div>
            <h1 className="success-message">Yayyy!!! See you soon! ❤️</h1>
            <p className="sub-text">I knew you'd say yes! 😉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;