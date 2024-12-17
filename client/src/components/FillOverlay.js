import React, { useState, useEffect, useRef } from 'react';

const FillOverlay = () => {
  const [fillPercentage, setFillPercentage] = useState(0);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
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
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
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
    const k = 10; // Adjust this for faster/slower filling
    const x = messages.length;
    const newPercentage = (1 - Math.exp(-x/k)) * 100;
    setFillPercentage(Math.min(newPercentage, 100));
    console.log(`Messages: ${x}, Fill: ${newPercentage.toFixed(1)}%`);

    // Trigger explosion effect at 90%
    if (newPercentage >= 90) {
      const container = document.querySelector('.fill-container');
      if (container) {
        container.classList.add('explode');
        setTimeout(() => container.classList.remove('explode'), 1000);
      }
    }
  }, [messages]);

  // Test function
  const handleTestClick = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'test' }));
    }
  };

  // Reset function
  const handleReset = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
    }
  };

  return (
    <div className="relative w-full h-96 bg-gray-800/50">
      {/* Text container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative fill-container">
          {/* Outline text */}
          <h1 
            className="text-8xl font-bold relative"
            style={{
              color: 'transparent',
              WebkitTextStroke: '3px black',
              textShadow: `
                -1px -1px 0 #000,  
                1px -1px 0 #000,
                -1px 1px 0 #000,
                1px 1px 0 #000,
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000,
                2px 2px 0 #000
              `
            }}
          >
            READY!
          </h1>
          
          {/* Fill overlay */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
              transition: 'clip-path 0.5s ease-out'
            }}
          >
            <h1 
              className="text-8xl font-bold"
              style={{
                background: 'linear-gradient(to top, #00ff00, #00cc00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.5))'
              }}
            >
              READY!
            </h1>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <div className="text-black font-bold text-xl bg-white/50 px-4 py-2 rounded">
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