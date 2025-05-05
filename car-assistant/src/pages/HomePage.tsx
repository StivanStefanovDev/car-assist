import React from 'react';
import '../styles/HomePage.css';
import SpeechRecognition from '../components/SpeechRecognition';

const HomePage: React.FC = () => (
  <div className="home-container">
    <h1 className="app-title">My VW Assistant</h1>
    <SpeechRecognition />
  </div>
);

export default HomePage;
