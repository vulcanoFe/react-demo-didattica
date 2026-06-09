/**
 * @file UncontrolledForm.tsx
 * @description Form con campi UNCONTROLLED — il DOM gestisce i valori direttamente.
 *
 * ## Cos'è un campo Uncontrolled?
 * Un campo "uncontrolled" lascia che il BROWSER gestisca il proprio valore,
 * come avveniva prima di React. React non tiene lo state aggiornato ad ogni
 * tasto: legge il valore DAL DOM solo quando necessario, tramite una `ref`.
 *
 * Flusso dati:
 *
 *   Utente digita
 *       ↓
 *   Il browser aggiorna il valore nel DOM (comportamento default)
 *       ↓
 *   React NON fa nulla (nessun re-render!)
 *       ↓
 *   Al submit: React legge il valore con inputRef.current?.value
 *
 * ## Cos'è una Ref?
 * Una `ref` è un oggetto `{ current: ... }` che React mantiene stabile tra i
 * render. NON causa re-render quando cambia (a differenza dello state).
 * È un "accesso diretto" a un elemento del DOM o a un valore mutabile.
 *
 * ## Quando usare Uncontrolled?
 * - Form semplici dove non serve validazione in tempo reale
 * - Integrazione con librerie di terze parti che gestiscono il DOM direttamente
 * - File input (type="file" è quasi sempre uncontrolled per motivi di sicurezza)
 * - Quando vuoi evitare re-render ad ogni tasto per motivi di performance estrema
 *
 * ## Limitazioni degli Uncontrolled:
 * - NON puoi fare validazione in tempo reale facilmente
 * - NON puoi modificare il valore programmaticamente (es: auto-completamento)
 * - È più difficile leggere i valori da componenti figli o fratelli
 * - NON puoi mostrare "Hai digitato: X" in tempo reale
 *
 * ## Validazione negli Uncontrolled:
 * È POSSIBILE fare validazione anche negli uncontrolled (leggi il valore con la ref
 * e mostri un errore in state), ma è più complesso e meno idiomatico in React.
 * In questo esempio mostriamo errori al submit, senza feedback visivo in tempo reale
 * sugli input stessi (che richiederebbe state aggiuntivo, rendendo il vantaggio minimo).
 */

import styles from "./FormDemo.module.css"
import { useRef, useState } from "react"
import type { FormEntry } from "./FormDemo"

// ─────────────────────────────────────────────────────────────────────────────
// DATI STATICI
// ─────────────────────────────────────────────────────────────────────────────

const REGIONI_ITALIANE = [
	"Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
	"Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
	"Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
	"Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
]

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface UncontrolledFormProps {
	onSubmit: (entry: FormEntry) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

function UncontrolledForm({ onSubmit }: UncontrolledFormProps) {
	/**
	 * REFS — Riferimenti diretti agli elementi del DOM.
	 *
	 * useRef<HTMLInputElement>(null) crea un oggetto { current: null }.
	 * Quando il componente monta, React imposta automaticamente `current`
	 * all'elemento DOM corrispondente tramite la prop `ref={nomeRef}`.
	 *
	 * Nota chiave: le ref NON causano re-render quando cambiano!
	 * Questo è fondamentale: non c'è un ciclo "cambia → re-render → mostra".
	 * Il DOM si aggiorna da solo (comportamento nativo del browser).
	 */
	const nomeRef = useRef<HTMLInputElement>(null)
	const sessoMRef = useRef<HTMLInputElement>(null)   // ref per radio "Maschio"
	const sessoFRef = useRef<HTMLInputElement>(null)   // ref per radio "Femmina"
	const dataNascitaRef = useRef<HTMLInputElement>(null)
	const regioneRef = useRef<HTMLSelectElement>(null)
	const emailRef = useRef<HTMLInputElement>(null)

	/**
	 * STATE solo per gli ERRORI.
	 * Anche in un form uncontrolled, per MOSTRARE messaggi di errore nell'UI
	 * dobbiamo usare lo state: il DOM non può "far apparire" un <span> rosso
	 * da solo. Quindi lo state è qui ridotto al minimo: solo gli errori,
	 * non i valori dei campi.
	 *
	 * Questo evidenzia un punto importante: spesso i form "uncontrolled"
	 * non sono COMPLETAMENTE senza state. La differenza è che lo state NON
	 * rispecchia i valori dei campi (quelli li legge il DOM direttamente).
	 */
	const [errors, setErrors] = useState<Record<string, string>>({})

	/**
	 * HANDLER: handleSubmit
	 *
	 * Al submit leggiamo i valori DIRETTAMENTE dal DOM tramite le ref.
	 * Poi eseguiamo la validazione e, se tutto è ok, chiamiamo onSubmit.
	 *
	 * Pattern per leggere le radio: cerchiamo quale delle due ref ha
	 * `checked === true`. Nelle radio button uncontrolled, il browser gestisce
	 * lo stato "selezionato", non React.
	 */
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Lettura dei valori DAL DOM tramite le ref
		const nome = nomeRef.current?.value ?? ""
		const sesso = sessoMRef.current?.checked
			? "M"
			: sessoFRef.current?.checked
				? "F"
				: ""
		const dataNascita = dataNascitaRef.current?.value ?? ""
		const regione = regioneRef.current?.value ?? ""
		const email = emailRef.current?.value ?? ""

		// Validazione al submit (non in tempo reale)
		const newErrors: Record<string, string> = {}
		if (!nome.trim()) newErrors.nome = "Il nome è obbligatorio"
		if (!sesso) newErrors.sesso = "Seleziona il sesso"
		if (!dataNascita) newErrors.dataNascita = "La data di nascita è obbligatoria"
		if (!email.trim()) {
			newErrors.email = "L'email è obbligatoria"
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Formato email non valido"
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setErrors({})
		onSubmit({
			tipo: "Uncontrolled",
			nome,
			sesso,
			dataNascita,
			regione: regione || "—",
			email,
		})

			// Reset manuale del form: con uncontrolled dobbiamo farlo a mano
			// perché React non controlla i valori.
			// HTMLFormElement.reset() è un metodo nativo del DOM che azzera tutti
			// gli input del form al loro defaultValue.
			; (e.target as HTMLFormElement).reset()
		setErrors({})
	}

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit}
			noValidate
		>
			{/* ── CAMPO: Nome ─────────────────────────────────────────────────────
          Nota la differenza rispetto al Controlled:
          - NON c'è `value={...}` → il browser gestisce il valore
          - `defaultValue=""` imposta solo il valore iniziale (non vincolante)
          - `ref={nomeRef}` aggancia la ref all'elemento DOM
          - NON c'è onChange per aggiornare lo state
      */}
			<div className={styles.formField}>
				<label htmlFor="u-nome" className={styles.label}>
					Nome <span className={styles.required}>*</span>
				</label>
				<input
					id="u-nome"
					type="text"
					name="nome"
					ref={nomeRef}
					defaultValue=""
					placeholder="Mario Rossi"
					className={`${styles.input} ${errors.nome ? styles.inputError : ""}`}
				/>
				<div className={styles.errorContainer}>
					{errors.nome && (
						<span className={styles.error} role="alert">{errors.nome}</span>
					)}
				</div>
			</div>

			{/* ── CAMPO: Sesso (Radio Button) ──────────────────────────────────────
          Ogni radio button ha la propria ref per leggere lo stato `checked`.
          Non c'è `checked={...}` → il browser gestisce la selezione.
          `defaultChecked` impostato su false (equivalente a non metterlo).
      */}
			<div className={styles.formField}>
				<span className={styles.label}>
					Sesso <span className={styles.required}>*</span>
				</span>
				<div className={`${styles.radioGroup} ${errors.sesso ? styles.radioGroupError : ""}`}>
					<label className={styles.radioLabel}>
						<input
							type="radio"
							name="u-sesso"
							value="M"
							ref={sessoMRef}
						/>
						Maschio
					</label>
					<label className={styles.radioLabel}>
						<input
							type="radio"
							name="u-sesso"
							value="F"
							ref={sessoFRef}
						/>
						Femmina
					</label>
				</div>
				<div className={styles.errorContainer}>
					{errors.sesso && (
						<span className={styles.error} role="alert">{errors.sesso}</span>
					)}
				</div>
			</div>

			{/* ── CAMPO: Data di Nascita ────────────────────────────────────────────
          Uncontrolled: il browser mostra il datepicker nativo e gestisce il valore.
          Noi leggiamo il valore solo al submit con dataNascitaRef.current?.value.
      */}
			<div className={styles.formField}>
				<label htmlFor="u-data" className={styles.label}>
					Data di nascita <span className={styles.required}>*</span>
				</label>
				<input
					id="u-data"
					type="date"
					name="dataNascita"
					ref={dataNascitaRef}
					className={`${styles.input} ${errors.dataNascita ? styles.inputError : ""}`}
					max={new Date().toISOString().split("T")[0]}
				/>
				<div className={styles.errorContainer}>
					{errors.dataNascita && (
						<span className={styles.error} role="alert">{errors.dataNascita}</span>
					)}
				</div>
			</div>

			{/* ── CAMPO: Regione (Select) ───────────────────────────────────────────
          La <select> uncontrolled usa ref per leggere il valore selezionato.
          Nessun `value` prop: il browser gestisce la selezione corrente.
      */}
			<div className={styles.formField}>
				<label htmlFor="u-regione" className={styles.label}>
					Regione preferita
				</label>
				<select
					id="u-regione"
					name="regione"
					ref={regioneRef}
					className={styles.input}
				>
					<option value="">— Nessuna preferenza —</option>
					{REGIONI_ITALIANE.map((r) => (
						<option key={r} value={r}>{r}</option>
					))}
				</select>
				<div className={styles.errorContainer} />
			</div>

			{/* ── CAMPO: Email ─────────────────────────────────────────────────────*/}
			<div className={styles.formField}>
				<label htmlFor="u-email" className={styles.label}>
					Email <span className={styles.required}>*</span>
				</label>
				<input
					id="u-email"
					type="email"
					name="email"
					ref={emailRef}
					defaultValue=""
					placeholder="mario@esempio.it"
					className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
				/>
				<div className={styles.errorContainer}>
					{errors.email && (
						<span className={styles.error} role="alert">{errors.email}</span>
					)}
				</div>
			</div>

			<div className={styles.buttonRow}>
				<button type="submit" className={styles.submitBtn}>
					Invia →
				</button>
			</div>
		</form>
	)
}

export default UncontrolledForm