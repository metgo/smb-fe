import './index.css'
import './i18n'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { store } from './store/store.ts'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position='top-center' />
      <App />
    </Provider>
  </StrictMode>,
)
