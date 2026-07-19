import React from 'react';
import ReactDOM from 'react-dom/client';
// import { registerSW } from 'virtual:pwa-register';  // ← Comment this out
import App from './App.jsx';
import './styles/theme.css';

// registerSW({ immediate: true });  // ← Comment this out

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);