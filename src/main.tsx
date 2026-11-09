import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { AuthProvider } from '@/providers/AuthProvider'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
