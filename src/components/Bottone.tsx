import { memo } from "react"
import styled from "styled-components"
import { useLifecycleLogger } from "../hooks/useLifecycleLogger"

/**
 * Props del componente Bottone
 *
 * NOTE:
 * - Il prefisso "$" è richiesto da styled-components per evitare che
 *   la prop venga passata al DOM (altrimenti React genererebbe warning)
 * - Il valore determina esclusivamente lo stile (non la logica)
 */
interface BottoneProps {
	$primario: boolean
}

/**
 * StyledButton
 * ------------
 * Bottone stilizzato tramite styled-components.
 *
 * IMPORTANT:
 * - Questo styled component viene creato UNA SOLA VOLTA (non ad ogni render)
 * - La funzione dentro template literal viene invece rieseguita ad ogni render
 *   per calcolare lo stile dinamico
 *
 * DEBUG:
 * - Il console.log serve per dimostrare quando viene rivalutato lo stile
 *
 * WHY:
 * - Usiamo styled-components per avere styling dinamico basato sulle props
 * - Separiamo completamente la logica di rendering dalla logica di styling
 */
const StyledButton = styled.button<BottoneProps>`
  background-color: ${(props) => {
		console.log("🎨 [STYLE EVAL] Bottone:", props.$primario)
		return props.$primario ? "blue" : "gray"
	}};
  color: white;
  padding: 10px;
  margin: 10px;
`

/**
 * Bottone
 * -------
 * Componente presentazionale che renderizza un bottone stilizzato dinamicamente.
 *
 * WHY:
 * - Incapsula sia comportamento che styling legati al concetto di "bottone primario"
 * - Permette di osservare facilmente:
 *   - ciclo di vita (useLifecycleLogger)
 *   - render (console.log)
 *   - ricalcolo dello stile (StyledButton)
 *
 * OTTIMIZZAZIONE:
 * - Il componente è wrappato in React.memo
 * - Evita re-render se le props NON cambiano
 *
 * ATTENZIONE:
 * - Anche con memo:
 *   - Se il parent re-renderizza e passa una nuova reference → re-render comunque
 *   - Lo style viene ricalcolato solo quando il componente renderizza
 *
 * DEBUG FLOW:
 * 1. Render → console.log("🔄 RENDER Bottone")
 * 2. Styled eval → console.log("🎨 STYLE EVAL")
 * 3. Lifecycle → useLifecycleLogger
 */
function Bottone(props: BottoneProps) {

	/**
	 * Hook custom per tracciare il ciclo di vita del componente
	 *
	 * WHY:
	 * - Utile per debug e per capire mount/update/unmount
	 * - Qui logghiamo anche il valore della prop primaria
	 */
	useLifecycleLogger("Bottone", { primario: props.$primario })

	// Log esplicito di ogni render
	console.log("🔄 RENDER Bottone");

	return (
		<StyledButton {...props}>
			Bottone dinamico
		</StyledButton>
	)
}

/**
 * Export memoizzato
 *
 * WHY:
 * - Evita render inutili se $primario non cambia
 *
 * LIMITAZIONE:
 * - Confronto shallow → funziona bene qui perché props è semplice (boolean)
 * - Se props diventassero oggetti complessi → necessario custom comparator
 */
export default memo(Bottone);