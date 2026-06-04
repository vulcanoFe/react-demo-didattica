/**
 * 📄 CryptoLive Component
 * -----------------------------------------------------
 * Questo componente rappresenta la UI per:
 * - avviare una connessione WebSocket
 * - fermarla
 * - visualizzare dati realtime (prezzo, variazione)
 *
 * 🎯 Responsabilità:
 * ✅ Gestire interazione utente (input + bottoni)
 * ✅ Dispatchare azioni Redux
 * ✅ Leggere stato globale tramite selector
 *
 * ❌ NON gestisce:
 * - WebSocket (delegato al middleware)
 * - logica di business complessa
 * - stato condiviso (usa Redux)
 *
 * 🧠 Concetto chiave:
 * Questo è un componente "thin" (leggero).
 * Fa solo orchestrazione tra UI e Redux.
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startSocket, stopSocket } from "../slices/cryptoslice";
import type { RootState } from "../store";
import styles from "./CryptoLive.module.css";

export default function CryptoLive() {

	/**
	 * 🚀 Dispatch Redux
	 * -------------------------------------------------
	 * Permette di inviare azioni allo store.
	 *
	 * Flusso:
	 * dispatch(action) → middleware → reducer → stato aggiornato
	 */
	const dispatch = useDispatch();

	/**
	 * 📝 Stato locale (UI state)
	 * -------------------------------------------------
	 * Questo stato NON è globale perché:
	 * ✅ è temporaneo (input utente)
	 * ✅ non serve ad altri componenti
	 *
	 * Default: "btcusdt"
	 */
	const [input, setInput] = useState("btcusdt");

	/**
	 * 📥 Selezione stato globale
	 * -------------------------------------------------
	 * useSelector accede allo store Redux.
	 *
	 * Prendiamo:
	 * - stato → connesso/disconnesso
	 * - prezzo → valore realtime
	 * - variazione → % 24h
	 *
	 * RootState garantisce type-safety.
	 */
	const { stato, prezzo, variazione } = useSelector(
		(state: RootState) => state.crypto
	);

	/**
	 * 🟢 HANDLE SUBMIT (START SOCKET)
	 * -------------------------------------------------
	 * Triggerato quando l'utente invia il form.
	 *
	 * Cosa fa:
	 * - previene refresh pagina
	 * - dispatcha startSocket con il symbol
	 *
	 * Flusso completo:
	 * UI → startSocket → middleware → WebSocket open
	 */
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		dispatch(startSocket(input));
	}

	/**
	 * 🛑 HANDLE STOP
	 * -------------------------------------------------
	 * Triggerato dal bottone Stop.
	 *
	 * Cosa fa:
	 * - dispatcha stopSocket
	 *
	 * Flusso completo:
	 * UI → stopSocket → middleware → WebSocket close
	 */
	const handleStop = () => {
		dispatch(stopSocket());
	};

	/**
	 * 🎨 RENDER UI
	 * -------------------------------------------------
	 * Componente dichiarativo:
	 * la UI riflette SEMPRE lo stato Redux.
	 */
	// logica per il colore relativo al trend
	let trendClass = styles.neutral;

	if (variazione !== null) {
		if (variazione > 0) trendClass = styles.up;
		else if (variazione < 0) trendClass = styles.down;
	}
	return (
		<div>
			<h2>📈 Crypto Live</h2>

			{/* 
             * 🧾 FORM INPUT
             * --------------------------
             * Permette di inserire il symbol
             */}
			<form onSubmit={handleSubmit}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="es: btcusdt"
				/>

				{/* 
				* 🟢 START
				* type="submit" → trigger handleSubmit
				*/}
				<button type="submit">🟢 Avvia</button>

				{/* 
				* 🛑 STOP
				* type="button" CRUCIALE:
				* evita submit del form (bug risolto)
				*/}
				<button type="button" onClick={handleStop}>
					🛑 Stop
				</button>
			</form>

			<hr />

			{/* 
			* 📊 DATA DISPLAY
			* --------------------------
			* Render basato su stato Redux
			*/}
			<div className={`${styles.cryptoDataRow}`}>
				<div className={`${styles.cryptoDataCard} ${trendClass}`}>
					<p>Stato: {stato}</p>
					<p>Prezzo: {prezzo}</p>
					<p>Variazione 24h: {variazione}%</p>
				</div>
			</div>
		</div>
	)
}