import { createContext, useContext, useMemo, useState } from 'react'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  async function login(password) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
    })
    const isValid = response.ok

    setIsAuthenticated(isValid)
    setAdminPassword(isValid ? password : '')
    return isValid
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
