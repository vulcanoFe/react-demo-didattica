/**
 * 🌐 Crypto WebSocket Middleware
 * -----------------------------------------------------
 * Questo middleware è responsabile della gestione
 * COMPLETA del ciclo di vita del WebSocket Binance.
 *
 * 🎯 Obiettivi:
 * - Centralizzare la gestione del WebSocket (best practice Redux)
 * - Evitare side-effects nei componenti
 * - Gestire riconnessioni automatiche (retry/backoff)
 * - Garantire una sola connessione attiva
 *
 * 🧠 Concetto chiave:
 * Il WebSocket NON vive nei componenti o negli hook,
 * ma qui, come side-effect controllato da Redux.
 */

import { type Middleware } from "@reduxjs/toolkit";
import { setConnesso, setDati, setDisconnesso, startSocket, stopSocket } from "../slices/cryptoslice";

export const cryptoMiddleware: Middleware = (store) => {

	/**
	 * 🧩 Stato interno del middleware (NON Redux!)
	 * -----------------------------------------------------
	 * Queste variabili vivono nella closure del middleware
	 * e NON nello store Redux perché:
	 *
	 * ✅ non devono triggerare render
	 * ✅ sono dettagli tecnici (non UI state)
	 * ✅ devono persistere tra dispatch
	 */

	// WebSocket attivo
	let ws: WebSocket | null = null;

	// Symbol corrente (es: btcusdt)
	let currentSymbol: string | null = null;

	// Timeout per retry (serve per poterlo cancellare)
	let retryTimeout: any = null;

	// Numero tentativi di riconnessione (per backoff)
	let tentativi = 0;

	/**
	 * 🔁 Pipeline del middleware Redux
	 * -----------------------------------------------------
	 * next(action) passa l'action ai reducer.
	 * Dopo, possiamo reagire all'action per gestire side-effects.
	 */
	return (next) => (action: any) => {

		// ✅ Lasciamo sempre passare l'action ai reducer
		const result = next(action);

		/**
		 * 🟢 START SOCKET
		 * -------------------------------------------------
		 * Triggerato da dispatch(startSocket(symbol))
		 *
		 * Responsabilità:
		 * - evitare connessioni duplicate
		 * - chiudere eventuale connessione precedente
		 * - avviare nuova connessione
		 */
		if (action.type === startSocket.type) {
			const symbol = action.payload;

			/**
			 * ⚠️ PROTEZIONE: evita connessioni duplicate
			 * -------------------------------------------------
			 * Se stiamo già ascoltando lo stesso symbol,
			 * NON creiamo una nuova connessione.
			 */
			if (currentSymbol === symbol && ws) {
				console.log("⚠️ Socket già attivo per questo symbol");
				return result;
			}

			/**
			 * 🔄 Cambio symbol
			 * -------------------------------------------------
			 * Se esiste una connessione attiva:
			 * - la chiudiamo
			 * - ne apriamo una nuova
			 *
			 * Questo garantisce:
			 * ✅ una sola connessione attiva
			 * ✅ nessun leak di connessioni
			 */
			if (ws) {
				ws.close();
				ws = null;
			}

			currentSymbol = symbol;
			tentativi = 0;

			connect();
		}

		/**
		 * 🔴 STOP SOCKET
		 * -------------------------------------------------
		 * Triggerato da dispatch(stopSocket())
		 *
		 * Responsabilità:
		 * - fermare la connessione
		 * - bloccare eventuali retry
		 */
		if (action.type === stopSocket.type) {

			// ✅ Flag globale: indica stop manuale
			currentSymbol = null;

			/**
			 * 🔥 IMPORTANTISSIMO
			 * Cancella eventuali retry schedulati
			 * (altrimenti il socket ripartirebbe)
			 */
			if (retryTimeout) {
				clearTimeout(retryTimeout);
			}

			// ✅ Chiude connessione attiva
			if (ws) {
				ws.close();
				ws = null;
			}
		}

		return result;

		/**
		 * 🔌 Funzione di connessione (closure interna)
		 * -----------------------------------------------------
		 * Non viene esportata → è privata del middleware.
		 *
		 * Usa variabili della closure:
		 * - currentSymbol
		 * - ws
		 * - tentativi
		 */
		function connect() {

			// ✅ NON connettersi se stop manuale
			if (!currentSymbol) return;

			const url = `wss://stream.binance.com:9443/ws/${currentSymbol.toLowerCase()}@ticker`;
			console.log(`🔌 Connessione a: ${url}`);

			ws = new WebSocket(url);

			/**
			 * ✅ OPEN CONNECTION
			 * -------------------------------------------------
			 * - aggiorna stato globale
			 * - resetta retry
			 */
			ws.onopen = () => {
				console.log("✅ Connesso");
				store.dispatch(setConnesso());
				tentativi = 0;
			}

			/**
			 * 📩 HANDLE MESSAGE
			 * -------------------------------------------------
			 * Ricezione dati realtime da Binance.
			 *
			 * Trasformiamo il payload e lo salviamo in Redux.
			 */
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);

				store.dispatch(
					setDati({
						prezzo: parseFloat(data.c),
						variazione: parseFloat(data.P)
					})
				);
			};

			/**
			 * ❌ HANDLE ERROR
			 * -------------------------------------------------
			 * In caso di errore:
			 * - chiudiamo la connessione
			 * - lasciamo che onclose gestisca il retry
			 */
			ws.onerror = () => {
				ws?.close();
			}

			/**
			 * 🔌 CLOSE CONNECTION
			 * -------------------------------------------------
			 * Gestisce:
			 * - disconnessione
			 * - retry automatico
			 */
			ws.onclose = () => {
				console.log("🔌 Chiuso");

				store.dispatch(setDisconnesso());

				/**
				 * 🛑 STOP MANUALE
				 * -------------------------------------------------
				 * Se currentSymbol è null significa
				 * che l'utente ha premuto STOP.
				 *
				 * 👉 NON facciamo retry
				 */
				if (!currentSymbol) {
					console.log("🛑 STOP manuale");
					return;
				}

				/**
				 * ♻️ RETRY con exponential backoff
				 * -------------------------------------------------
				 * Evita:
				 * - overload server
				 * - retry troppo frequenti
				 *
				 * Formula:
				 * 1s → 2s → 4s → 8s → ... → max 30s
				 */
				const delay = Math.min(1000 * 2 ** tentativi, 30000);

				console.log(`♻️ Retry tra ${delay / 1000}s (tentativo: ${tentativi})`);

				tentativi++;

				// ✅ salviamo il timeout per poterlo cancellare
				retryTimeout = setTimeout(connect, delay);
			};
		}
	}
}