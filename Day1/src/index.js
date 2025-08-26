/**
 * React App Entry Point
 * Universal Authentication System - Day 1 of 365 Days Challenge
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
