import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// ✨ 1. IMPORTAMOS NUESTRO PROVEEDOR DE AUTENTICACIÓN
import { AuthProvider } from './context/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ✨ 2. ENVOLVEMOS LA APLICACIÓN PARA QUE TODOS TENGAN ACCESO A LA BILLETERA */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)