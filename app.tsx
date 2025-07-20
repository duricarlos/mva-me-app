"use client"

import { useState } from "react"
import { LoginPage } from "./components/login-page"
import { DashboardPage } from "./components/dashboard-page"
import { mockUser } from "./lib/data"
import type { User } from "./lib/types"

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (username: string, password: string) => {
    // Simulación de autenticación
    if (username === "vendedor1" && password === "123456") {
      setUser(mockUser)
    } else {
      alert("Credenciales incorrectas. Usa: vendedor1 / 123456")
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardPage user={user} />
}
