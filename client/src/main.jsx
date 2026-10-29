import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ style: { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--line)' } }} />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
