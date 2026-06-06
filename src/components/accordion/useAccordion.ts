/**
 * useAccordion.ts
 * ================
 * Custom Hook che incapsula l'accesso al AccordionContext.
 *
 * PERCHÉ UN HOOK DEDICATO invece di useContext diretto?
 *
 *   1. VALIDAZIONE AUTOMATICA
 *      Se un sotto-componente viene usato fuori dall'Accordion
 *      (senza Provider), il context vale null. Senza questo hook,
 *      il componente crasherebbe con un errore criptico tipo
 *      "Cannot read properties of null (reading 'openId')".
 *      Con questo hook l'errore è immediato e descrittivo:
 *      "Must be used inside Accordion".
 *
 *   2. SINGOLO PUNTO DI ACCESSO
 *      Tutti i sotto-componenti importano useAccordion, non
 *      AccordionContext direttamente. Se in futuro cambia il nome
 *      o la struttura del context, si modifica solo qui.
 *
 *   3. SEPARAZIONE DELLE RESPONSABILITÀ
 *      Il context sa come è fatto lo stato.
 *      Il hook sa come accedervi in sicurezza.
 *      I componenti sanno solo come usarlo.
 */

import { useContext } from "react"
import { AccordionContext } from "./AccordionContext"

/**
 * Restituisce {openId, setOpenId} dal AccordionContext.
 *
 * @throws {Error} Se chiamato fuori da un albero con <Accordion> come antenato.
 * @returns {AccordionContextType} Lo stato condiviso dell'accordion.
 */
export function useAccordion() {
	const ctx = useContext(AccordionContext)

	// Guardia esplicita: null significa che non c'è nessun Provider nell'albero.
	if (!ctx) throw new Error("Must be used inside Accordion")

	return ctx
}