import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { addSkipLink } from './utils/accessibility'

// Recover from stale lazy-loaded chunks after a deploy.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload()
})

// Add accessibility skip link
addSkipLink()

const deferredInit = async () => {
  try {
    const [analyticsModule, performanceModule, serviceWorkerModule] = await Promise.all([
      import('./services/analytics'),
      import('./services/performanceMonitor'),
      import('./utils/serviceWorker'),
    ])

    analyticsModule.default.init()
    performanceModule.default.init()
    serviceWorkerModule.registerServiceWorker()
  } catch (error) {
    console.error('Deferred initialization failed:', error)
  }
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(deferredInit, { timeout: 2000 })
} else {
  window.setTimeout(deferredInit, 0)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

const bootLoader = document.getElementById('app-boot-loader')
if (bootLoader) {
  requestAnimationFrame(() => {
    bootLoader.classList.add('is-hidden')
    window.setTimeout(() => {
      bootLoader.remove()
    }, 260)
  })
}
