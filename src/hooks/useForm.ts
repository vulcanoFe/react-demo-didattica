/**
 * @file useForm.ts
 * @description Custom hook per la gestione di form CONTROLLED in React.
 *
 * ## Cos'è un Custom Hook?
 * Un custom hook è una funzione JavaScript il cui nome inizia con "use" e che
 * può chiamare altri hook React. Serve a ESTRARRE e RIUTILIZZARE logica stateful
 * tra componenti diversi, senza dover duplicare codice.
 *
 * ## Perché useForm?
 * La gestione di un form controlled richiede:
 *   1. Uno stato per i valori (`values`)
 *   2. Uno stato per gli errori di validazione (`errors`)
 *   3. Handler per ogni cambio di input (`handleChange`)
 *   4. Handler per il submit con validazione (`handleSubmit`)
 *
 * Mettere tutto questo in ogni componente form sarebbe ripetitivo.
 * useForm centralizza questa logica in un unico posto riutilizzabile.
 */

import { useState, useCallback } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// TIPI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipo generico per i valori del form.
 * Record<string, string> = oggetto con chiavi stringa e valori stringa.
 * Esempio: { name: "Mario", email: "mario@test.it" }
 */
type FormValues = Record<string, string>

/**
 * Tipo per la funzione di validazione.
 * Riceve i valori correnti del form e restituisce un oggetto di errori.
 * Se un campo è valido, NON deve apparire nell'oggetto errori.
 * Se un campo NON è valido, deve apparire con un messaggio di errore.
 */
type ValidateFn = (values: FormValues) => FormValues

/**
 * Tipo per la funzione di submit.
 * Riceve i valori validati del form come argomento.
 */
type OnSubmitFn = (values: FormValues) => void

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @hook useForm
 * @param initialValues - Valori iniziali del form (es: { name: "", email: "" })
 * @param validate - Funzione di validazione da applicare prima del submit
 * @returns Oggetto con valori, handler e errori del form
 *
 * @example
 * const { values, handleChange, handleSubmit, errors } = useForm(
 *   { name: "", email: "" },
 *   (vals) => {
 *     const errs: Record<string, string> = {}
 *     if (!vals.name) errs.name = "Obbligatorio"
 *     return errs
 *   }
 * )
 */
export function useForm(initialValues: FormValues, validate: ValidateFn) {
	/**
	 * STATE: values
	 * Contiene i valori CORRENTI di tutti i campi del form.
	 * Ogni volta che l'utente digita, questo state viene aggiornato,
	 * causando un re-render del componente con il nuovo valore.
	 * Questo è il cuore del pattern "Controlled Input".
	 */
	const [values, setValues] = useState<FormValues>(initialValues)

	/**
	 * STATE: errors
	 * Contiene gli errori di validazione per ogni campo.
	 * Viene popolato solo al momento del submit (o alla modifica, se volete
	 * validazione in tempo reale — qui scegliamo solo al submit per semplicità).
	 */
	const [errors, setErrors] = useState<FormValues>({})

	/**
	 * HANDLER: handleChange
	 * Viene chiamato ogni volta che l'utente modifica un campo input.
	 *
	 * Nota: `useCallback` evita che questa funzione venga ricreata ad ogni render.
	 * Questo è una ottimizzazione: la funzione viene ricreata SOLO se le dipendenze
	 * nell'array [] cambiano. Qui l'array è vuoto, quindi viene creata una sola volta.
	 *
	 * Come funziona:
	 * - e.target.name → il nome del campo (es: "name", "email")
	 * - e.target.value → il valore digitato dall'utente
	 * - Usiamo lo spread operator per aggiornare SOLO il campo modificato,
	 *   lasciando invariati tutti gli altri.
	 */
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const { name, value } = e.target
			setValues((prev) => ({ ...prev, [name]: value }))
			// Puliamo l'errore del campo non appena l'utente inizia a modificarlo:
			// così il feedback visivo rosso sparisce subito, senza aspettare il submit.
			setErrors((prev) => ({ ...prev, [name]: "" }))
		},
		[]
	)

	/**
	 * HANDLER: handleSubmit
	 * Restituisce una funzione da passare all'evento onSubmit del <form>.
	 *
	 * Pattern "higher-order function": handleSubmit(onSuccess) restituisce un
	 * event handler. In questo modo possiamo passare una callback personalizzata
	 * (cosa fare con i dati validi) senza perdere la logica di validazione.
	 *
	 * Flusso:
	 *   1. Impedisce il comportamento default del browser (ricarica la pagina)
	 *   2. Esegue la validazione
	 *   3. Se ci sono errori → li mostra e NON procede
	 *   4. Se non ci sono errori → chiama onSuccess con i valori
	 */
	const handleSubmit = useCallback(
		(onSuccess: OnSubmitFn) =>
			(e: React.FormEvent<HTMLFormElement>) => {
				e.preventDefault()
				const validationErrors = validate(values)
				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					return
				}
				setErrors({})
				onSuccess(values)
				// Reset del form dopo il submit avvenuto con successo
				setValues(initialValues)
			},
		[values, validate, initialValues]
	)

	/**
	 * RESET: resetForm
	 * Utility per azzerare manualmente il form dall'esterno.
	 */
	const resetForm = useCallback(() => {
		setValues(initialValues)
		setErrors({})
	}, [initialValues])

	return { values, errors, handleChange, handleSubmit, resetForm }
}