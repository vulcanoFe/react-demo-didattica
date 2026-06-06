import type { ComponentType } from "react"
import { useAuth } from "../hooks/useAuth"

/**
 * HOC `withAuth` — Higher-Order Component per la protezione delle route.
 *
 * PATTERN: Higher-Order Component (HOC)
 *
 * SCOPO:
 *   Incapsula la logica di autenticazione a livello di HOC, separandola
 *   completamente dal componente protetto. Il componente wrapped non sa
 *   nulla di autenticazione: si occupa solo del proprio rendering.
 *
 * UTILIZZO:
 *   const ProtectedPage = withAuth(MyPageComponent)
 *   // Poi in App.tsx:
 *   <Route path="/protected" element={<ProtectedPage />} />
 *
 * VANTAGGIO rispetto al Custom Hook:
 *   - La logica di guardia è definita UNA volta e riusata ovunque
 *   - Il componente wrapped resta "puro": non conosce il concetto di auth
 *   - Più componenti possono essere protetti con withAuth(Comp) senza
 *     ripetere il check if(!isLogged) in ogni file
 *
 * @template P - Le props del componente originale (passate in trasparenza)
 * @param WrappedComponent - Il componente da proteggere
 * @returns Un nuovo componente che renderizza il fallback se non autenticato,
 *          oppure <WrappedComponent {...props} /> se autenticato
 */
function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
	/**
	 * Componente interno generato dall'HOC.
	 * Il displayName migliora la leggibilità nel React DevTools:
	 * apparirà come "withAuth(Dashboard)" invece di "Component".
	 */
	function AuthGuard(props: P) {
		const isLogged = useAuth()

		console.log(`🔄 RENDER withAuth(${WrappedComponent.displayName ?? WrappedComponent.name})`)

		if (!isLogged) {
			console.log("🚫 NOT AUTH → render fallback")
			return <p>Non autenticato (HOC guard)...</p>
		}

		console.log("✅ AUTH → render componente protetto")

		// Passa tutte le props originali al componente wrapped in trasparenza
		return <WrappedComponent {...props} />
	}

	// Imposta un nome leggibile per il React DevTools
	AuthGuard.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name})`

	return AuthGuard
}

export default withAuth