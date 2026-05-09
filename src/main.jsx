import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AdminAuthProvider } from './context/AdminAuth.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
