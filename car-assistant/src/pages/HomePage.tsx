import React from 'react';
import '../styles/HomePage.css';

interface HomePageProps {
  onStartListening: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartListening }) => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">👋 Welcome to My VW Assistant</h1>
        <p className="home-description">
          Your personal driving companion. Use voice commands to log fuel, track mileage, or find the nearest gas station — hands-free and offline.
        </p>
        <button className="home-button" onClick={onStartListening}>
          🎙️ Start Listening
        </button>
      </div>
    </div>
  );
};

export default HomePage;
