import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import './index.css'
import { router } from './router'
import { logVersionInfo } from './version'

// Log version info for cache debugging
logVersionInfo()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
