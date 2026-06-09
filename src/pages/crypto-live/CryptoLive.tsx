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

import { useDispatch, useSelector } from "react-redux";
import { startSocket, stopSocket } from "../../slices/cryptoslice";
import type { RootState } from "../../store";
import CryptoCard from "./CryptoCard";
import SymbolSearch from "./SymbolSearch";
import { useState } from "react";

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
	 * 🪙 Symbol attivo
	 * -------------------------------------------------
	 * Rappresenta il simbolo attualmente selezionato
	 * e usato nella connessione WebSocket
	 */
	const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

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
	const handleStart = (symbol: string) => {
		setActiveSymbol(symbol);
		dispatch(startSocket(symbol));
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
		setActiveSymbol('');
		dispatch(stopSocket());
	};


	return (
		<div>
			<h2>📈 Crypto Live</h2>

			{/* 
			* 🧾 FORM INPUT
			* --------------------------
			* Permette di inserire il symbol
			*/}
			<SymbolSearch onSelect={handleStart}></SymbolSearch>

			<hr />

			{/* 
			* 📊 DATA DISPLAY
			* --------------------------
			* Render basato su stato Redux
			*/}
			<CryptoCard
				stato={stato}
				prezzo={prezzo}
				variazione={variazione}
				symbol={activeSymbol}
				onStop={handleStop}
			></CryptoCard>
		</div>
	)
}