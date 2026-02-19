import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import App from './App.tsx'
import { Agentation } from 'agentation'
import { RoleProvider } from './context/RoleContext'
import RoleSwitcher from './components/RoleSwitcher'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider>
      <App />
      <RoleSwitcher />
      {import.meta.env.DEV && <Agentation />}
    </RoleProvider>
  </StrictMode>,
)

