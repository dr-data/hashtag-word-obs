import React, { useState, useEffect, useRef } from 'react';

const ExplodedLetter = ({ letter, index, active, isGreen }) => {
  if (!active) return <span>{letter}</span>;
  
  const randomAngle = Math.random() * 360;
  const randomDistance = 200 + Math.random() * 400;
  const delay = index * 50;
  
  const letterStyle = isGreen ? {
    color: '#00ff00',
    WebkitTextStroke: '6px #00ff00',
    filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.5))'
  } : {
    color: 'transparent',
    WebkitTextStroke: '6px #f95858'
  };
  
  return (
    <span
      style={{
        display: 'inline-block',
        transform: active ? `translate(${Math.cos(randomAngle) * randomDistance}px, ${Math.sin(randomAngle) * randomDistance}px) rotate(${randomAngle}deg)` : 'none',
        transition: `transform 1s ease-out ${delay}ms, opacity 1s ease-out ${delay}ms`,
        opacity: active ? 0 : 1,
        ...letterStyle
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
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://${window.location.host}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      if (data.type === 'ready') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'reset') {
        setMessages([]);
        setIsExploded(false);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
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

  // Exponential fill calculation
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

  const baseStyle = {
    fontSize: '12rem',
    fontFamily: '"Russo One", sans-serif',  // Using Russo One font
    fontWeight: 'bold',
    color: 'transparent',
    WebkitTextStroke: '4px #f95858',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.05em',
    filter: 'drop-shadow(2px 2px 0 #f95858) drop-shadow(-2px -2px 0 #f95858) drop-shadow(-2px 2px 0 #f95858) drop-shadow(2px -2px 0 #f95858)'
  };

  const animationStyle = !isExploded ? {
    transform: `
      translateX(${(fillPercentage/45) * Math.sin(Date.now() / 50) * 15}px)
      rotate(${(fillPercentage/100) * Math.sin(Date.now() / 100) * 2}deg)
      scale(${1 + (fillPercentage/100) * 0.1})
    `,
    transition: 'transform 0.05s ease-out'
  } : {};

  return (
    <div className="relative w-full h-96 bg-gray-800/50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ready-container relative" style={animationStyle}>
          {/* Base text with outline */}
          <div className="relative" style={{
            ...baseStyle,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
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
              className="absolute inset-0"
              style={{
                clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
                transition: 'clip-path 0.3s ease-in-out',
                willChange: 'clip-path',
                transform: 'translateX(-6px)'  // Adjust this value to align perfectly
              }}
            >
              <div style={{
                ...baseStyle,
                WebkitTextStroke: 'none',
                WebkitTextFillColor: '#00ff00',
                color: '#00ff00',
                filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.5))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}>
                {letters.map((letter, index) => (
                  <span key={index} style={{
                    display: 'inline-block',
                    position: 'relative'
                  }}>{letter}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <div className="text-#f95858 font-bold text-xl bg-white/50 px-4 py-2 rounded">
          Count: {messages.length} | Fill: {fillPercentage.toFixed(1)}%
        </div>
        
        <button 
          onClick={handleTestClick}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Test Ready
        </button>
        
        <button 
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FillOverlay;