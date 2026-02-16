import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { analytics, performanceMonitor } from './services'
import { addSkipLink } from './utils/accessibility'
import { registerServiceWorker } from './utils/serviceWorker'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
// Initialize analytics
analytics.init()

// Initialize performance monitoring
performanceMonitor.init()

// Add accessibility skip link
addSkipLink()

// Register service worker for PWA
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
