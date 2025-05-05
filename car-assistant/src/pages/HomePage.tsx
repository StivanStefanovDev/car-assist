import React from 'react';
import '../styles/HomePage.css';

import SpeechRecognition from '../components/SpeechRecognition';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <SpeechRecognition />
    </div>
  );
};

export default HomePage;
