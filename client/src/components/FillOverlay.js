import React, { useState, useEffect, useRef } from 'react';

const ExplodedLetter = ({ letter, index, active, isGreen }) => {
  if (!active) return <span className="letter-container">{letter}</span>;
  
  const randomAngle = Math.random() * 360;
  const randomDistance = 200 + Math.random() * 400;
  const delay = index * 50;
  
  return (
    <span
      className={`exploded-letter ${active ? 'active' : ''} ${isGreen ? 'green' : ''}`}
      style={{
        transform: active ? `translate(${Math.cos(randomAngle) * randomDistance}px, ${Math.sin(randomAngle) * randomDistance}px) rotate(${randomAngle}deg)` : 'none',
        transitionDelay: `${delay}ms`
      }}
    >
      {letter}
    </span>
  );
};

const FillOverlay = () => {
  const [fillPercentage, setFillPercentage] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isExploded, setIsExploded] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const containerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://${window.location.host}`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ready') {
        setMessages(prev => [...prev, data]);
        // Trigger pulse animation
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 150); // Duration of pulse animation
      } else if (data.type === 'reset') {
        setMessages([]);
        setIsExploded(false);
      }
    };

    wsRef.current.onclose = () => {
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current = new WebSocket(`ws://${window.location.host}`);
        }
      }, 3000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update shake intensity based on percentage
  useEffect(() => {
    if (containerRef.current) {
      const intensity = Math.min((fillPercentage / 45) * 15, 15); // Max 15px shake
      containerRef.current.style.setProperty('--shake-intensity', `${intensity}px`);
    }
  }, [fillPercentage]);

  useEffect(() => {
    const k = 18;
    const x = messages.length;
    const newPercentage = (1 - Math.exp(-x/k)) * 100;
    setFillPercentage(Math.min(newPercentage, 100));
    
    if (newPercentage >= 75 && !isExploded) {
      setIsExploded(true);
    }
  }, [messages, isExploded]);

  const handleTestClick = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'test' }));
    }
  };

  const handleReset = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
    }
  };

  const letters = "READY!".split("");

  return (
    <div className="relative w-full h-96 bg-gray-800/50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          ref={containerRef}
          className={`ready-container relative ${isPulsing ? 'pulse' : ''}`}
        >
          {/* Base text with outline */}
          <div className="ready-text flex justify-center items-center h-full">
            {letters.map((letter, index) => (
              <ExplodedLetter
                key={index}
                letter={letter}
                index={index}
                active={isExploded}
                isGreen={isExploded}
              />
            ))}
          </div>
          
          {/* Fill overlay */}
          {!isExploded && (
            <div 
              className="fill-overlay absolute inset-0"
              style={{
                '--fill-percentage': `${100 - fillPercentage}%`
              }}
            >
              <div className="ready-text ready-text-fill flex justify-center items-center h-full">
                {letters.map((letter, index) => (
                  <span key={index} className="letter-container">{letter}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="control-panel">
        <div className="count-display">
          Count: {messages.length} | Fill: {fillPercentage.toFixed(1)}%
        </div>
        <button onClick={handleTestClick} className="test-button">
          Test Ready
        </button>
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};

export default FillOverlay;