// src/components/SpeechRecognition.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import '../styles/SpeechRecognition.css';

// configure default Leaflet marker icons
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl: iconShadowUrl,
});

const SpeechRecognition: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [stations, setStations] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const recognitionRef = useRef<any>(null);

  // 1) Initialize Web Speech API
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          setTranscript(prev => (prev + txt + ' ').trim());
        } else {
          interim += txt;
        }
      }

      const full = (transcript + ' ' + interim).toLowerCase();
      if (!showMap && /(petrol|gas station)/.test(full)) {
        setShowMap(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          });
        }
      }
    };

    recog.onerror = (e: any) => console.error('Speech recognition error', e.error);
    recognitionRef.current = recog;
  }, [showMap, transcript]);

  // 2) Fetch nearby gas stations once coords are set
  useEffect(() => {
    if (showMap && coords) {
      const query = `
        [out:json];
        node[amenity=fuel](around:2000,${coords.lat},${coords.lng});
        out;
      `;
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      })
        .then(res => res.json())
        .then(data => {
          const elems = data.elements || [];
          setStations(
            elems.map((n: any) => ({
              lat: n.lat,
              lng: n.lon,
              name: n.tags?.name || 'Gas Station',
            }))
          );
        })
        .catch(console.error);
    }
  }, [coords, showMap]);

  // 3) Toggle speech recognition on/off
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setListening(!listening);
  };

  return (
    <div className="voice-ui-card">
      <img
        src="/microphone.png"
        alt="Microphone"
        className={`mic-icon ${listening ? 'listening' : ''}`}
        onClick={toggleListening}
      />

      <h2 className="prompt-text">How can I help you?</h2>
      <p className="sub-prompt">For example: “Find me a gas station nearby.”</p>

      <div className="transcript-display">
        {transcript || <span className="placeholder">Your speech will appear here...</span>}
      </div>

      {showMap && coords && (
        <div className="map-container">
          <MapContainer
  center={[coords.lat, coords.lng] as [number, number]}
  zoom={14}
  scrollWheelZoom={false}
  style={{ width: '100%', height: '100%' }}
>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Marker position={[coords.lat, coords.lng]}>
    <Popup>Your location</Popup>
  </Marker>
  {stations.map((s, idx) => (
    <Marker key={idx} position={[s.lat, s.lng]}>
      <Popup>{s.name}</Popup>
    </Marker>
  ))}
</MapContainer>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;
