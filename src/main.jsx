import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { startThree } from './three/gate'
import './styles.css'

const root = document.getElementById('root')
if (root.firstElementChild) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)

// After hydration has committed, so the first store change re-renders normally.
setTimeout(startThree, 0)

const q = new URLSearchParams(location.search)
if (q.has('perf')) import('./perf/overlay').then((m) => m.mountPerfOverlay())
if (q.has('zones')) import('./perf/zones').then((m) => m.watchZones())
