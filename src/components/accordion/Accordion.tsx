/**
 * Accordion.tsx
 * ==============
 * Implementazione completa del pattern COMPOUND COMPONENTS applicato
 * a un accordion (fisarmonica) espandibile.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PATTERN: Compound Components
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * CONCETTO CHIAVE:
 *   Un gruppo di componenti che lavorano INSIEME condividendo uno stato
 *   implicito tramite Context. Il consumer (chi usa l'accordion in pagina)
 *   compone liberamente i sotto-componenti con una sintassi dichiarativa,
 *   senza dover passare props di stato tra di essi.
 *
 * FLUSSO DATI:
 *   Accordion (root)
 *     └── gestisce: useState(openId)
 *     └── pubblica: openId + setOpenId via Context
 *           ├── Header  → legge openId (per bold), scrive setOpenId (al click)
 *           └── Panel   → legge openId (per mostrare/nascondere)
 *
 * STRUTTURA DEI SOTTO-COMPONENTI:
 *   Accordion.Item    → contenitore visivo di Header + Panel
 *   Accordion.Header  → pulsante che apre/chiude un pannello (toggle)
 *   Accordion.Panel   → contenuto visibile solo quando il suo id è openId
 *
 * API DI UTILIZZO (consumer):
 *   <Accordion>
 *     <Accordion.Item>
 *       <Accordion.Header id="faq-1">Domanda</Accordion.Header>
 *       <Accordion.Panel  id="faq-1">Risposta</Accordion.Panel>
 *     </Accordion.Item>
 *   </Accordion>
 *
 *   Nota: Header e Panel con lo stesso `id` sono automaticamente sincronizzati.
 *   Il consumer non gestisce nessuno stato — lo fa tutto l'Accordion internamente.
 *
 * VANTAGGI rispetto a un accordion "monolitico" con props:
 *   - Nessun prop drilling: lo stato non attraversa manualmente ogni livello
 *   - API componibile: il consumer decide struttura e ordine degli elementi
 *   - Estensibile: si possono aggiungere sotto-componenti senza rompere l'API
 *   - Perfetto per design system: i token visivi sono centralizzati qui
 *
 * SVANTAGGI da tenere a mente:
 *   - Lo stato è "nascosto" nel context → più difficile da tracciare senza DevTools
 *   - Ogni modifica a openId causa un re-render di tutti i sotto-componenti
 *     connessi al context (mitigabile con React.memo se necessario)
 *   - I sotto-componenti DEVONO essere discendenti dell'Accordion (non funzionano standalone)
 */

import { useState } from "react"
import { useLifecycleLogger } from "../../hooks/useLifecycleLogger"
import { AccordionContext } from "./AccordionContext"
import { useAccordion } from "./useAccordion"

// ── Tipi ────────────────────────────────────────────────────────────────────

type AccordionProps = {
	children: React.ReactNode
}

type ItemProps = {
	children: React.ReactNode
}

type HeaderProps = {
	/**
	 * Identificatore univoco che collega questo Header al Panel corrispondente.
	 * Deve essere identico all'`id` del Panel gemello nello stesso Item.
	 */
	id: string
	children: React.ReactNode
}

type PanelProps = {
	/**
	 * Identificatore univoco che collega questo Panel all'Header corrispondente.
	 * Deve essere identico all'`id` dell'Header gemello nello stesso Item.
	 */
	id: string
	children: React.ReactNode
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT COMPONENT — Accordion
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Componente radice del Compound.
 *
 * RESPONSABILITÀ:
 *   - Detiene lo stato condiviso `openId` (quale pannello è aperto)
 *   - Avvolge i figli con il Context Provider, rendendo lo stato
 *     disponibile a tutta la sottoalbero senza prop drilling
 *
 * INVARIANTE:
 *   Un solo pannello può essere aperto alla volta (accordion esclusivo).
 *   Se si vuole permettere aperture multiple, si cambierebbe openId
 *   da `string | null` a `Set<string>` — modifica localizzata solo qui
 *   e nel context, senza toccare il consumer.
 */
export function Accordion({ children }: AccordionProps) {
	/**
	 * `openId`: l'id del pannello aperto, o null se tutti sono chiusi.
	 * È l'UNICA fonte di verità per l'intero accordion.
	 */
	const [openId, setOpenId] = useState<string | null>(null)

	useLifecycleLogger("Accordion", { openId })
	console.log("📦 Accordion STATE:", openId)

	return (
		/**
		 * Il Provider inietta {openId, setOpenId} nel context.
		 * Qualsiasi discendente che chiama useAccordion() riceverà questi valori
		 * e si aggiornerà automaticamente quando openId cambia.
		 */
		<AccordionContext.Provider value={{ openId, setOpenId }}>
			<div style={{ border: "1px solid #333", borderRadius: 8, padding: 10 }}>
				{children}
			</div>
		</AccordionContext.Provider>
	)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOTTO-COMPONENTE — Item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Contenitore visivo che raggruppa un Header e il suo Panel.
 *
 * RESPONSABILITÀ:
 *   Puramente strutturale/visiva. Non legge il context, non gestisce stato.
 *   Esiste per dare una separazione visiva tra le voci dell'accordion
 *   e per offrire al consumer un punto di aggancio semantico (un "item"
 *   dell'accordion è concettualmente distinto dalla sua intestazione e dal contenuto).
 *
 * NOTA: non avere accesso al context è una scelta deliberata —
 *   Item non ha bisogno di sapere quale pannello è aperto.
 */
function Item({ children }: ItemProps) {
	useLifecycleLogger("Accordion.Item")
	return <div style={{ marginBottom: 10 }}>{children}</div>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOTTO-COMPONENTE — Header
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Intestazione cliccabile di una voce dell'accordion.
 *
 * RESPONSABILITÀ:
 *   - LEGGE openId per sapere se questo header è quello attivo (bold visivo)
 *   - SCRIVE su setOpenId al click, implementando la logica di toggle:
 *       · se questo header è già aperto → chiude (openId → null)
 *       · se un altro è aperto o tutti chiusi → apre questo (openId → id)
 *
 * LOGICA DI TOGGLE:
 *   setOpenId(prev => prev === id ? null : id)
 *   Usando la forma funzionale del setter si legge il valore più aggiornato
 *   di openId senza doverlo dichiarare come dipendenza, evitando closure stale.
 *
 * PROP `id`:
 *   È il "nome" che identifica questa voce. Deve corrispondere all'id
 *   del Panel gemello affinché i due siano sincronizzati.
 */
function Header({ id, children }: HeaderProps) {
	const { openId, setOpenId } = useAccordion()

	useLifecycleLogger(`Header ${id}`, { openId })

	/** true quando questo specifico header è quello aperto */
	const isOpen = openId === id

	return (
		<div
			onClick={() => {
				console.log(`👉 CLICK Header ${id}`)
				// Toggle: se già aperto chiude, altrimenti apre questo e chiude gli altri
				setOpenId(prev => (prev === id ? null : id))
			}}
			style={{
				cursor: "pointer",
				padding: 10,
				background: "#f0f0f0",
				fontWeight: isOpen ? "bold" : "normal", // feedback visivo dello stato
				borderRadius: 6,
			}}
		>
			{children}
		</div>
	)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOTTO-COMPONENTE — Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Contenuto espandibile di una voce dell'accordion.
 *
 * RESPONSABILITÀ:
 *   - LEGGE openId per decidere se renderizzare il proprio contenuto
 *   - NON scrive mai sul context: è un componente puramente di lettura
 *
 * STRATEGIA DI VISIBILITÀ — `return null`:
 *   Quando il panel non è aperto, restituisce null (unmount completo).
 *   Alternativa comune: `display: none` (mount sempre, nascosto via CSS).
 *
 *   `return null` è preferibile quando:
 *     · il contenuto è pesante (evita rendering inutile)
 *     · si vuole che gli effetti (useEffect) dentro il panel si attivino
 *       solo quando il panel è visibile
 *
 *   `display: none` è preferibile quando:
 *     · si vuole preservare lo stato interno del panel tra aperture
 *     · le animazioni CSS di entrata/uscita devono funzionare
 *
 * PROP `id`:
 *   Confrontato con openId: se coincidono, il panel è visibile.
 *   Deve essere identico all'id dell'Header gemello.
 */
function Panel({ id, children }: PanelProps) {
	const { openId } = useAccordion()

	useLifecycleLogger(`Panel ${id}`, { openId })

	const isOpen = openId === id
	console.log(`👀 Panel ${id} render -> isOpen:`, isOpen)

	// Unmount completo quando chiuso — vedi nota sulla strategia di visibilità
	if (!isOpen) return null

	return (
		<div
			style={{
				padding: 10,
				border: "1px solid #ddd",
				borderTop: "none",
				borderRadius: "0 0 6px 6px",
			}}
		>
			{children}
		</div>
	)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOUND EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Attacca i sotto-componenti come proprietà statiche di Accordion.
 *
 * PERCHÉ questa tecnica?
 *   Permette al consumer di importare UN SOLO simbolo (`Accordion`)
 *   e accedere a tutti i sotto-componenti tramite dot notation:
 *     Accordion.Item, Accordion.Header, Accordion.Panel
 *
 *   Vantaggi:
 *     · Un solo import nel file consumer
 *     · Namespace esplicito: è chiaro che Header appartiene all'Accordion
 *     · Impedisce l'uso accidentale di Header fuori dal suo contesto
 *
 *   Alternativa: esportare ogni componente separatamente.
 *   Svantaggio: il consumer deve importare e ricordare 4 simboli distinti,
 *   perdendo la coesione visiva del pattern.
 */
Accordion.Item = Item
Accordion.Header = Header
Accordion.Panel = Panel