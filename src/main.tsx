import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <TRPCProvider>
            <App />
          </TRPCProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
