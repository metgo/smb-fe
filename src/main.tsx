import './index.css'
import './i18n'

import { Toaster } from 'sonner'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { store } from './store/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position='top-center' richColors />
      <App />
    </Provider>
  </StrictMode>,
)
