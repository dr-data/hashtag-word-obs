// App.js
import React from 'react';
import FillOverlay from './components/FillOverlay';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <FillOverlay />
        </div>
      </div>
    </div>
  );
}

export default App;