import { createContext, useContext, useMemo, useState } from 'react'
import { adminRequest } from '../lib/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  async function login(password) {
    await adminRequest('/api/admin/login', {
      method: 'POST',
      password,
    })

    setIsAuthenticated(true)
    setAdminPassword(password)
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
