/**
 * @file FormDemo.tsx
 * @description Pagina principale che confronta form Controlled vs Uncontrolled.
 *
 * ## Struttura della pagina:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                    Titolo + Intro                            │
 *   ├────────────────────────┬────────────────────────────────────┤
 *   │   Form CONTROLLED      │   Form UNCONTROLLED                 │
 *   │   (con spiegazione)    │   (con spiegazione)                 │
 *   ├────────────────────────┴────────────────────────────────────┤
 *   │              Tabella degli invii                             │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * ## Gestione degli ID con useRef:
 * Usiamo un ref come CONTATORE per generare ID univoci per ogni entry
 * della lista. Questo è un pattern importante da capire.
 *
 * ### Perché useRef e non useState?
 * Un contatore per ID NON deve essere nello state perché:
 * 1. Il suo cambiamento NON deve causare un re-render del componente
 *    (un re-render per aggiornare solo l'ID interno sarebbe uno spreco)
 * 2. Deve essere MUTABILE direttamente (ref.current++ funziona)
 * 3. Deve PERSISTERE tra i render (al contrario di una variabile locale)
 *
 * ### Perché non una variabile locale?
 *   let counter = 0  ← SBAGLIATO!
 *   Ogni re-render ricrea la funzione componente, resettando counter a 0.
 *   Useresti sempre lo stesso ID per entries diverse.
 *
 * ### Perché non una variabile globale fuori dal componente?
 *   let globalCounter = 0  ← funzionerebbe, ma è un anti-pattern:
 *   - Inquina il modulo con stato globale
 *   - Se hai più istanze del componente, condividono lo stesso contatore
 *   - Non è "pulito" dal punto di vista architetturale
 *
 * ### useRef è la scelta giusta perché:
 * - È locale al componente (ogni istanza ha il suo contatore)
 * - Persiste tra i render (non si azzera ad ogni render)
 * - NON causa re-render quando cambia (perfetto per un semplice contatore)
 * - È il meccanismo React ufficiale per "valori mutabili che persistono"
 *
 * ### Perché è necessario per la `key` della lista?
 * React usa la prop `key` per identificare gli elementi di una lista.
 * Una key deve essere:
 *   - UNIVOCA tra gli elementi della stessa lista
 *   - STABILE (non cambiare tra i render per lo stesso elemento)
 *
 * Usare l'indice dell'array come key è sconsigliato quando gli elementi
 * possono essere riordinati o eliminati (l'indice cambierebbe).
 * Un ID incrementale generato dal nostro ref è sempre univoco e stabile.
 */

import { useRef, useState } from "react"
import styles from "./FormDemo.module.css"
import ControlledForm from "./ControlledForm"
import UncontrolledForm from "./UncontrolledForm"

// ─────────────────────────────────────────────────────────────────────────────
// TIPI ESPORTATI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Struttura dati di una singola entry nella tabella degli invii.
 * Esportata perché viene usata anche dai componenti figli.
 */
export interface FormEntry {
	id?: number          // Assegnato da FormDemo, non dai form figli
	tipo: "Controlled" | "Uncontrolled"
	nome: string
	sesso: string
	dataNascita: string
	regione: string
	email: string
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE SPIEGAZIONE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Componente helper per mostrare la card di spiegazione sopra ogni form.
 * Separato per non inquinare il componente principale con JSX prolisso.
 */
function ExplanationCard({
	type,
	children,
}: {
	type: "controlled" | "uncontrolled"
	children: React.ReactNode
}) {
	return (
		<div className={`${styles.explanation} ${styles[`explanation--${type}`]}`}>
			<div className={styles.explanationBadge}>
				{type === "controlled" ? "⚛️ Controlled" : "🌐 Uncontrolled"}
			</div>
			{children}
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

function FormDemo() {
	/**
	 * STATE: entries
	 * Lista di tutti gli invii dei form (sia controlled che uncontrolled).
	 * Vive qui nel componente padre perché deve essere condivisa tra i due form.
	 * Questo è il pattern "lifting state up": lo state sale al minimo antenato
	 * comune dei componenti che ne hanno bisogno.
	 */
	const [entries, setEntries] = useState<FormEntry[]>([])

	/**
	 * REF: idCounter
	 * Contatore per generare ID univoci per le entry della tabella.
	 *
	 * useRef(0) → crea { current: 0 }
	 * Ogni volta che aggiungiamo una entry, facciamo idCounter.current++
	 * PRIMA di usarlo, così ogni entry ottiene un ID diverso.
	 *
	 * Questo NON causa re-render: React non sa che idCounter.current è cambiato,
	 * e va bene così — non vogliamo un re-render per questo!
	 * Il re-render avviene perché cambia `entries` (state), non idCounter.
	 *
	 * @example
	 * idCounter.current = 0 → primo invio ottiene id: 1
	 * idCounter.current = 1 → secondo invio ottiene id: 2
	 * ... e così via
	 */
	const idCounter = useRef<number>(0)

	/**
	 * HANDLER: handleFormSubmit
	 * Callback passata a entrambi i form come prop `onSubmit`.
	 * Aggiunge una nuova entry alla lista, assegnando un ID univoco tramite la ref.
	 *
	 * Nota: setEntries usa la forma funzionale `prev => [...]` per garantire
	 * che stiamo lavorando con lo state più recente, anche in caso di aggiornamenti
	 * rapidi in successione (buona pratica con array in state).
	 */
	const handleFormSubmit = (entry: FormEntry) => {
		// Incrementiamo il contatore e usiamo il nuovo valore come ID
		idCounter.current += 1
		const newEntry: FormEntry = { ...entry, id: idCounter.current }
		setEntries((prev) => [...prev, newEntry])
	}

	return (
		<div className={styles.page}>
			{/* ── HEADER ──────────────────────────────────────────────────────── */}
			<div className={styles.pageHeader}>
				<h2>Controlled vs Uncontrolled Inputs</h2>
				<p className={styles.pageSubtitle}>
					Due approcci fondamentali per gestire i form in React.
					Compila entrambi i form e osserva i risultati nella tabella.
				</p>
			</div>

			{/* ── GRIGLIA DEI FORM ─────────────────────────────────────────────
          Affiancati orizzontalmente: Controlled a sinistra, Uncontrolled a destra.
          Usare CSS Grid (o Flexbox) qui è più robusto di un layout a float.
      */}
			<div className={styles.formsGrid}>

				{/* ─ COLONNA SINISTRA: Controlled ─────────────────────────────── */}
				<div className={styles.formColumn}>
					<ExplanationCard type="controlled">
						<h3 className={styles.explanationTitle}>Controlled Input</h3>
						<p className={styles.explanationText}>
							React è la <strong>fonte di verità</strong>. Ogni campo ha un{" "}
							<code>value</code> collegato allo state e un{" "}
							<code>onChange</code> che aggiorna lo state ad ogni tasto.
						</p>
						<ul className={styles.explanationList}>
							<li>✅ Validazione in tempo reale</li>
							<li>✅ Lettura del valore ovunque nel componente</li>
							<li>✅ Modifica programmatica del valore</li>
							<li>⚠️ Re-render ad ogni tasto</li>
						</ul>
					</ExplanationCard>
					<ControlledForm onSubmit={handleFormSubmit} />
				</div>

				{/* ─ COLONNA DESTRA: Uncontrolled ──────────────────────────────── */}
				<div className={styles.formColumn}>
					<ExplanationCard type="uncontrolled">
						<h3 className={styles.explanationTitle}>Uncontrolled Input</h3>
						<p className={styles.explanationText}>
							Il <strong>DOM è la fonte di verità</strong>. Il valore è gestito
							dal browser; React lo legge solo quando serve tramite una{" "}
							<code>ref</code>.
						</p>
						<ul className={styles.explanationList}>
							<li>✅ Nessun re-render durante la digitazione</li>
							<li>✅ Meno codice boilerplate</li>
							<li>⚠️ Validazione solo al submit</li>
							<li>⚠️ Non si può leggere il valore in tempo reale</li>
						</ul>
					</ExplanationCard>
					<UncontrolledForm onSubmit={handleFormSubmit} />
				</div>

			</div>

			{/* ── TABELLA DEGLI INVII ──────────────────────────────────────────
          Visualizzata solo quando ci sono entry (evita una tabella vuota).
          Ogni entry ha un `id` generato dal nostro contatore ref.
      */}
			{entries.length > 0 && (
				<div className={styles.tableSection}>
					<h3 className={styles.tableTitle}>
						📋 Storico invii ({entries.length})
					</h3>
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.th}>ID</th>
									<th className={styles.th}>Tipo</th>
									<th className={styles.th}>Nome</th>
									<th className={styles.th}>Sesso</th>
									<th className={styles.th}>Data Nascita</th>
									<th className={styles.th}>Regione</th>
									<th className={styles.th}>Email</th>
								</tr>
							</thead>
							<tbody>
								{entries.map((entry) => (
									/**
									 * La prop `key` è obbligatoria per le liste in React.
									 * React usa la key per:
									 * 1. Identificare quali elementi sono stati aggiunti/rimossi
									 * 2. Evitare re-render inutili degli elementi invariati
									 * 3. Mantenere lo state locale degli elementi (es: input dentro una lista)
									 *
									 * Usiamo entry.id (generato dal nostro idCounter ref) invece
									 * dell'indice dell'array perché:
									 * - L'ID è stabile anche se riordini la lista
									 * - L'indice cambierebbe se inserisci un elemento in mezzo
									 */
									<tr
										key={entry.id}
										className={`${styles.tr} ${entry.tipo === "Controlled" ? styles.trControlled : styles.trUncontrolled}`}
									>
										<td className={styles.td}>
											<span className={styles.idBadge}>#{entry.id}</span>
										</td>
										<td className={styles.td}>
											<span className={`${styles.tipoBadge} ${entry.tipo === "Controlled" ? styles.tipoBadgeControlled : styles.tipoBadgeUncontrolled}`}>
												{entry.tipo}
											</span>
										</td>
										<td className={styles.td}>{entry.nome}</td>
										<td className={styles.td}>{entry.sesso === "M" ? "♂ Maschio" : "♀ Femmina"}</td>
										<td className={styles.td}>
											{/* Formattiamo la data da YYYY-MM-DD a DD/MM/YYYY per la visualizzazione */}
											{entry.dataNascita
												? new Date(entry.dataNascita).toLocaleDateString("it-IT")
												: "—"}
										</td>
										<td className={styles.td}>{entry.regione}</td>
										<td className={styles.td}>
											<a href={`mailto:${entry.email}`} className={styles.emailLink}>
												{entry.email}
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Placeholder quando non ci sono ancora invii */}
			{entries.length === 0 && (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}>📭</span>
					<p>Nessun invio ancora. Compila uno dei form qui sopra!</p>
				</div>
			)}
		</div>
	)
}

export default FormDemo