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
	return (
		<div>
			<h2>Dashboard (Custom Hook)</h2>

			{/*
			 * Sezione informativa sul pattern utilizzato.
			 * Mostra all'utente quale pattern è in uso e offre
			 * un link diretto alla versione HOC per confronto.
			 */}
			<p>
				Questo componente protegge la route usando un <strong>Custom Hook</strong>{" "}
				(<code>useAuth</code>): la logica di autenticazione è scritta direttamente
				qui dentro.
			</p>
			<p>
				Per vedere lo stesso esempio risolto con il pattern <strong>HOC</strong>{" "}
				e uno schema riepilogativo delle differenze:
			</p>
			<a href="/dashboard-hoc">Vai all'esempio con HOC →</a>
		</div>
	)
}

export default Dashboard