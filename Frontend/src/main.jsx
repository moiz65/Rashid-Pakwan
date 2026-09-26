import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'next-themes'
import { store, persistor } from '@/store'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLoader } from '@/components/shared/AppLoader'
import { DataSeeder } from '@/components/DataSeeder'
import { AuthSession } from '@/components/auth/AuthSession'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<AppLoader />} persistor={persistor}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <DataSeeder>
              <AuthSession>
                <App />
              </AuthSession>
              <Toaster richColors position="top-right" />
            </DataSeeder>
          </TooltipProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
