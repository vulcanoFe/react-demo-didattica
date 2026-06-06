import { useAuth } from "../hooks/useAuth"

/**
 * `Dashboard` — Componente protetto tramite Custom Hook.
 *
 * PATTERN: Custom Hook
 *
 * DIFFERENZA rispetto all'HOC:
 *   Qui la logica di autenticazione (if !isLogged → fallback) è scritta
 *   DENTRO il componente. Il componente è responsabile sia del check
 *   di autenticazione sia del proprio rendering.
 *
 *   PRO: più esplicito e diretto, facile da leggere
 *   CONTRO: se hai 10 pagine protette, devi ripetere il blocco
 *           if (!isLogged) in ognuna di esse
 *
 *   Con l'HOC invece basta wrappare: withAuth(QualsiesiPagina)
 */
function Dashboard() {
	const isLogged = useAuth()

	console.log("🔄 RENDER Dashboard")

	if (!isLogged) {
		console.log("🚫 NOT AUTH → render fallback")
		return <p>Non autenticato (Custom Hook)...</p>
	}

	console.log("✅ AUTH → render dashboard")
	return <h2>Dashboard (Custom Hook)</h2>
}

export default Dashboard