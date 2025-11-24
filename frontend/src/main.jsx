import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Add basic styles inline since CSS import had issues
document.head.insertAdjacentHTML('beforeend', `
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #000000; 
      color: #ffffff; 
      line-height: 1.4; 
    }
    input, select, button {
      font-family: inherit;
      font-size: 14px;
      border: 1px solid #333333;
      background: #000000;
      color: #ffffff;
      padding: 12px 16px;
      transition: all 0.15s ease;
      outline: none;
    }
    input:focus, select:focus { border-color: #ffffff; background: #111111; }
    button {
      cursor: pointer;
      background: #ffffff;
      color: #000000;
      border: none;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 12px;
    }
    button:hover { background: #f0f0f0; }
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      height: 2px;
      background: #333333;
      padding: 0;
      border: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #ffffff;
      cursor: pointer;
    }
    input[type="checkbox"] { width: 16px; height: 16px; padding: 0; accent-color: #ffffff; }
  </style>
`)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
