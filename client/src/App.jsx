import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes/@system/AppRoutes.jsx'
import { Toaster } from './app/components/@system/Toast/Toaster.jsx'
import { AuthProvider } from './app/store/@system/auth.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
