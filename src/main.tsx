import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global window.onerror listener capturing runtime errors on Windows 7, 8, 10 & 11
// Sends diagnostic reports to the central logging system for legacy environment debugging.
if (typeof window !== 'undefined') {
  const ua = navigator.userAgent || '';
  if (/Windows NT/i.test(ua)) {
    window.onerror = (message, source, lineno, colno, error) => {
      const errorPayload = {
        timestamp: new Date().toISOString(),
        eventType: 'WINDOWS_RUNTIME_ERROR',
        userAgent: ua,
        os: ua.includes('Windows NT 6.1') ? 'Windows 7' :
            ua.includes('Windows NT 6.2') ? 'Windows 8' :
            ua.includes('Windows NT 6.3') ? 'Windows 8.1' :
            ua.includes('Windows NT 10.0') ? 'Windows 10/11' : 'Windows NT (Desktop)',
        message: String(message || ''),
        source: String(source || ''),
        lineno: lineno || 0,
        colno: colno || 0,
        stack: error?.stack || ''
      };

      try {
        fetch('https://www.e-vedhika.in/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorPayload)
        }).catch(() => {});
      } catch (e) {}

      console.error('[E-Vedhika Windows Legacy Error Monitor]:', errorPayload);
    };

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      try {
        fetch('https://www.e-vedhika.in/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            eventType: 'WINDOWS_UNHANDLED_PROMISE_REJECTION',
            userAgent: ua,
            message: reason?.message || String(reason || ''),
            stack: reason?.stack || ''
          })
        }).catch(() => {});
      } catch (e) {}
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
