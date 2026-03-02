import { createContext, useContext, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gym_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_user')) } catch { return null }
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('gym_token', data.token)
    localStorage.setItem('gym_user',  JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('gym_token')
    localStorage.removeItem('gym_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
