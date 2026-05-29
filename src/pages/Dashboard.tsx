import { useAuth } from "../hooks/useAuth"

function Dashboard() {
  const isLogged = useAuth()

  console.log("🔄 RENDER Dashboard")

  if (!isLogged) {
    console.log("🚫 NOT AUTH → render fallback")
    return <p>Non autenticato...</p>
  }

  console.log("✅ AUTH → render dashboard")

  return <h2>Dashboard</h2>
}

export default Dashboard