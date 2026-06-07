/**
 * @file ControlledForm.tsx
 * @description Form con campi CONTROLLED — il cuore del pattern React per i form.
 *
 * ## Cos'è un campo Controlled?
 * Un campo "controlled" è un input il cui VALORE è completamente gestito dallo
 * STATE di React. Il DOM non ha mai il controllo: React è la "fonte di verità".
 *
 * Flusso dati (unidirezionale):
 *
 *   Utente digita
 *       ↓
 *   onChange si attiva
 *       ↓
 *   setState() aggiorna lo state
 *       ↓
 *   React re-renderizza il componente
 *       ↓
 *   L'input mostra il nuovo value dallo state
 *
 * Questo ciclo avviene ad OGNI tasto premuto.
 *
 * ## Vantaggi:
 * - Validazione in tempo reale possibile
 * - Puoi leggere il valore ovunque nel componente (è nello state)
 * - Puoi modificare/formattare il valore prima che appaia (es: toUpperCase)
 * - Il form è sempre "sincronizzato" con lo state React
 *
 * ## Svantaggi:
 * - Re-render ad ogni tasto (ma React è efficiente, raramente un problema reale)
 * - Più codice boilerplate rispetto agli uncontrolled
 */

import styles from "../pages/FormDemo.module.css"
import { useForm } from "../hooks/useForm"
import type { FormEntry } from "../pages/FormDemo"

// ─────────────────────────────────────────────────────────────────────────────
// DATI STATICI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista delle regioni italiane usata per la <select>.
 * È definita fuori dal componente perché è un dato COSTANTE:
 * metterla dentro causerebbe una nuova creazione dell'array ad ogni render,
 * sprecando memoria inutilmente.
 */
const REGIONI_ITALIANE = [
	"Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
	"Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
	"Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
	"Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
]

// ─────────────────────────────────────────────────────────────────────────────
// VALIDAZIONE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Funzione di validazione pura (non è un hook, non ha side effects).
 * Riceve i valori correnti del form e restituisce un oggetto di errori.
 *
 * Nota: anche questa è definita fuori dal componente per evitare
 * che venga ricreata ad ogni render. Non dipende da nessuno state interno.
 *
 * Campi obbligatori: nome, sesso, dataNascita, email
 * Facoltativi: regione
 */
function validateForm(values: Record<string, string>): Record<string, string> {
	const errors: Record<string, string> = {}

	if (!values.nome?.trim()) {
		errors.nome = "Il nome è obbligatorio"
	}

	if (!values.sesso) {
		errors.sesso = "Seleziona il sesso"
	}

	if (!values.dataNascita) {
		errors.dataNascita = "La data di nascita è obbligatoria"
	}

	// La regione è FACOLTATIVA → non la validiamo

	if (!values.email?.trim()) {
		errors.email = "L'email è obbligatoria"
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
		// Regex minimale per validare il formato email
		errors.email = "Formato email non valido"
	}

	return errors
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface ControlledFormProps {
	/** Callback chiamata quando il form viene inviato con successo */
	onSubmit: (entry: FormEntry) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

function ControlledForm({ onSubmit }: ControlledFormProps) {
	/**
	 * useForm è il nostro custom hook che gestisce:
	 * - values: i valori correnti di tutti i campi
	 * - errors: gli errori di validazione per ogni campo
	 * - handleChange: handler generico per onChange di input e select
	 * - handleSubmit: wrapper che valida e poi chiama la nostra callback
	 * - resetForm: azzera il form
	 *
	 * Nota il valore iniziale di sesso: "" (nessuna radio selezionata).
	 * Per le radio button, "controlled" significa che React decide quale
	 * è selezionata tramite la prop `checked`, non il DOM.
	 */
	const { values, errors, handleChange, handleSubmit } = useForm(
		{ nome: "", sesso: "", dataNascita: "", regione: "", email: "" },
		validateForm
	)

	/**
	 * Quando il form è valido, costruiamo l'oggetto FormEntry e lo passiamo
	 * al componente padre tramite la prop onSubmit.
	 * Il padre gestirà l'aggiunta alla lista degli invii.
	 */
	const handleValidSubmit = (vals: Record<string, string>) => {
		onSubmit({
			tipo: "Controlled",
			nome: vals.nome,
			sesso: vals.sesso,
			dataNascita: vals.dataNascita,
			regione: vals.regione || "—",
			email: vals.email,
		})
	}

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit(handleValidSubmit)}
			noValidate /* Disabilitiamo la validazione nativa del browser: usiamo la nostra */
		>
			{/* ── CAMPO: Nome ─────────────────────────────────────────────────────
          value={values.nome} → React controlla il valore mostrato
          onChange={handleChange} → ad ogni tasto, aggiorna lo state
          name="nome" → handleChange usa questo per sapere quale campo aggiornare
      */}
			<div className={styles.formField}>
				<label htmlFor="c-nome" className={styles.label}>
					Nome <span className={styles.required}>*</span>
				</label>
				<input
					id="c-nome"
					type="text"
					name="nome"
					value={values.nome}
					onChange={handleChange}
					placeholder="Mario Rossi"
					className={`${styles.input} ${errors.nome ? styles.inputError : ""}`}
					aria-describedby={errors.nome ? "c-nome-error" : undefined}
				/>
				{/* Contenitore errore con altezza minima riservata:
            evita il "layout shift" (salto del layout) quando l'errore appare/sparisce */}
				<div className={styles.errorContainer}>
					{errors.nome && (
						<span id="c-nome-error" className={styles.error} role="alert">
							{errors.nome}
						</span>
					)}
				</div>
			</div>

			{/* ── CAMPO: Sesso (Radio Button) ──────────────────────────────────────
          Le radio button controlled usano `checked` invece di `value`.
          checked={values.sesso === "M"} → React decide se è selezionata
          confrontando il valore dello state con il valore di questa radio.

          onChange funziona identico agli input text: aggiorna lo state
          con name="sesso" e value="M" (o "F").
      */}
			<div className={styles.formField}>
				<span className={styles.label}>
					Sesso <span className={styles.required}>*</span>
				</span>
				<div className={styles.radioGroup}>
					<label className={styles.radioLabel}>
						<input
							type="radio"
							name="sesso"
							value="M"
							checked={values.sesso === "M"}
							onChange={handleChange}
							className={errors.sesso ? styles.radioError : ""}
						/>
						Maschio
					</label>
					<label className={styles.radioLabel}>
						<input
							type="radio"
							name="sesso"
							value="F"
							checked={values.sesso === "F"}
							onChange={handleChange}
							className={errors.sesso ? styles.radioError : ""}
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
          input type="date" restituisce sempre una stringa nel formato "YYYY-MM-DD".
          Il browser renderizza un datepicker nativo, ma il valore è comunque
          gestito da React tramite value e onChange. Fully controlled!
      */}
			<div className={styles.formField}>
				<label htmlFor="c-data" className={styles.label}>
					Data di nascita <span className={styles.required}>*</span>
				</label>
				<input
					id="c-data"
					type="date"
					name="dataNascita"
					value={values.dataNascita}
					onChange={handleChange}
					className={`${styles.input} ${errors.dataNascita ? styles.inputError : ""}`}
					max={new Date().toISOString().split("T")[0]} /* Non si può nascere nel futuro */
				/>
				<div className={styles.errorContainer}>
					{errors.dataNascita && (
						<span className={styles.error} role="alert">{errors.dataNascita}</span>
					)}
				</div>
			</div>

			{/* ── CAMPO: Regione (Select) ───────────────────────────────────────────
          La <select> controlled funziona come un input text:
          - value={values.regione} → React controlla l'opzione selezionata
          - onChange={handleChange} → aggiorna lo state quando l'utente sceglie

          NON è obbligatoria, quindi non ha l'asterisco e non viene validata.
      */}
			<div className={styles.formField}>
				<label htmlFor="c-regione" className={styles.label}>
					Regione preferita
				</label>
				<select
					id="c-regione"
					name="regione"
					value={values.regione}
					onChange={handleChange}
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
				<label htmlFor="c-email" className={styles.label}>
					Email <span className={styles.required}>*</span>
				</label>
				<input
					id="c-email"
					type="email"
					name="email"
					value={values.email}
					onChange={handleChange}
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

export default ControlledForm