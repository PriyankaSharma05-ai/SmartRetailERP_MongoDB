import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontFamily: 'DM Sans' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
      }}
    />
  </BrowserRouter>
)
