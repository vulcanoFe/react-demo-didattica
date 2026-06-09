import withAuth from "../../hoc/withAuth"
import schema from "../../assets/hoc_vs_hook_comparison.svg"

/**
 * `DashboardContent` — Componente puro per il contenuto della dashboard.
 *
 * NOTA IMPORTANTE (pattern HOC):
 *   Questo componente NON sa nulla di autenticazione.
 *   Non importa useAuth, non fa check condizionali di login.
 *   Si occupa esclusivamente del proprio rendering.
 *
 *   La protezione avviene esternamente tramite `withAuth(DashboardContent)`.
 *   Questo è il vantaggio chiave rispetto al pattern Custom Hook:
 *   separazione netta tra logica di auth e logica di presentazione.
 */
function DashboardContent() {
	console.log("✅ RENDER DashboardContent — autenticazione già verificata dall'HOC")
	return (
		<>
			<h2>Dashboard (protetta da HOC)</h2>
			<p>
				<img src={schema} alt="Schema" />
			</p>
		</>
	)
}

/**
 * Esporta il componente avvolto dall'HOC `withAuth`.
 * `DashboardHOC` è il componente da usare nelle Route:
 * renderizzerà il fallback se non autenticato, oppure <DashboardContent /> se autenticato.
 */
const DashboardHOC = withAuth(DashboardContent)

export default DashboardHOC