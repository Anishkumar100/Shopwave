import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './store/store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

const ThemedToaster = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0a0a0a',
          border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : 'rgba(22,163,74,0.25)'}`,
          borderRadius: '14px',
          fontFamily: 'Outfit, sans-serif',
          boxShadow: isDark
            ? '0 20px 60px -15px rgba(0,0,0,0.6)'
            : '0 20px 60px -15px rgba(15,23,42,0.18)',
        },
        success: { iconTheme: { primary: isDark ? '#22c55e' : '#16a34a', secondary: isDark ? '#020617' : '#ffffff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#020617' : '#ffffff' } },
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <ThemedToaster />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
