import { createContext, useContext, useMemo, useState } from 'react'
import { adminRequest } from '../lib/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  async function sendOtp(email) {
    await adminRequest('/api/admin/login', {
      method: 'POST',
      body: { action: 'send_otp', email },
    })
    return true
  }

  async function login(email, otp) {
    const data = await adminRequest('/api/admin/login', {
      method: 'POST',
      body: { action: 'verify_otp', email, otp },
    })

    setIsAuthenticated(true)
    setAdminPassword(data.password)
    return true
  }

  function logout() {
    setIsAuthenticated(false)
    setAdminPassword('')
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      adminPassword,
      sendOtp,
      login,
      logout,
    }),
    [adminPassword, isAuthenticated],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }

  return context
}
