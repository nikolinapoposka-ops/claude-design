import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import App from './App.tsx'
import { RoleProvider } from './context/RoleContext'
import RoleSwitcher from './components/RoleSwitcher'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider>
      <App />
      <RoleSwitcher />
    </RoleProvider>
  </StrictMode>,
)

// Load agentation only in dev — Vite eliminates this block in production builds
if (import.meta.env.DEV) {
  import('agentation').then(({ Agentation }) => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    createRoot(el).render(
      <StrictMode>
        <Agentation />
      </StrictMode>,
    )
  })
}
