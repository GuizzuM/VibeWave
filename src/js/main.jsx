// main.jsx
// Ponto de entrada do React no processo de renderização (renderer).

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
