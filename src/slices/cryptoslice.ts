/**
 * 📦 Crypto Slice (Redux Toolkit)
 * -----------------------------------------------------
 * Questo slice rappresenta lo stato globale relativo
 * ai dati della criptovaluta e alla connessione WebSocket.
 *
 * 🎯 Responsabilità:
 * - Memorizzare lo stato della connessione (UI state)
 * - Memorizzare i dati realtime (prezzo + variazione)
 * - Esporre azioni per comandare il WebSocket (start/stop)
 *
 * 🧠 Nota importante:
 * Questo slice NON gestisce effetti collaterali (WebSocket),
 * ma solo lo stato.
 *
 * La logica del WebSocket è delegata al middleware.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * 🧾 Interfaccia dello stato
 * -----------------------------------------------------
 * Definisce la forma dello stato Redux per il dominio "crypto".
 *
 * ✅ symbol
 * - identifica la crypto attiva (es: btcusdt)
 * - è la "fonte di verità" per sapere cosa stiamo ascoltando
 *
 * ✅ stato
 * - rappresenta lo stato della connessione
 * - usato dalla UI (es: badge connesso/disconnesso)
 *
 * ✅ prezzo / variazione
 * - dati realtime aggiornati dal WebSocket
 * - null quando non disponibili
 */
interface CryptoState {
	symbol: string | null;
	stato: "connesso" | "disconnesso";
	prezzo: number | null;
	variazione: number | null;
}

/**
 * 🏁 Stato iniziale
 * -----------------------------------------------------
 * Applicazione appena caricata:
 * - nessuna connessione attiva
 * - nessun dato disponibile
 */
const initialState: CryptoState = {
	symbol: null,
	stato: "disconnesso",
	prezzo: null,
	variazione: null
};

/**
 * 🧠 Creazione dello slice
 * -----------------------------------------------------
 * createSlice:
 * - genera automaticamente reducer + action creators
 * - usa Immer → possiamo "mutare" lo stato in sicurezza
 *
 * name:
 * - namespace dello slice (usato nelle action type)
 */
const cryptoSlice = createSlice({
	name: "crypto",
	initialState,

	/**
	 * 🔧 Reducers
	 * -------------------------------------------------
	 * Sono funzioni pure che aggiornano lo stato.
	 *
	 * ⚠️ NON devono contenere:
	 * - API call
	 * - WebSocket
	 * - logica asincrona
	 *
	 * 👉 Solo aggiornamento stato.
	 */
	reducers: {

		/**
		 * 🟢 START SOCKET
		 * -------------------------------------------------
		 * Triggerato dalla UI per avviare una connessione.
		 *
		 * Cosa fa:
		 * - salva il symbol nello stato
		 *
		 * Cosa NON fa:
		 * - NON apre il WebSocket
		 *
		 * 👉 L'apertura reale viene gestita dal middleware.
		 */
		startSocket(state, action: PayloadAction<string>) {
			state.symbol = action.payload
		},

		/**
		 * 🔴 STOP SOCKET
		 * -------------------------------------------------
		 * Triggerato dalla UI per fermare la connessione.
		 *
		 * Cosa fa:
		 * - resetta lo stato
		 * - cancella i dati mostrati
		 *
		 * 👉 Il middleware si occupa di chiudere il WebSocket.
		 */
		stopSocket(state) {
			state.symbol = null;
			state.stato = "disconnesso";
			state.prezzo = null;
			state.variazione = null;
		},

		/**
		 * ✅ SET CONNESSO
		 * -------------------------------------------------
		 * Aggiorna lo stato quando il WebSocket è aperto.
		 *
		 * Triggerato dal middleware.
		 * Serve principalmente per la UI.
		 */
		setConnesso(state) {
			state.stato = "connesso";
		},

		/**
		 * ❌ SET DISCONNESSO
		 * -------------------------------------------------
		 * Aggiorna lo stato quando il WebSocket è chiuso.
		 *
		 * Triggerato dal middleware.
		 */
		setDisconnesso(state) {
			state.stato = "disconnesso";
		},

		/**
		 * 📊 SET DATI
		 * -------------------------------------------------
		 * Aggiorna i dati realtime provenienti dal WebSocket.
		 *
		 * Payload:
		 * - prezzo → prezzo corrente
		 * - variazione → variazione percentuale 24h
		 *
		 * 👉 Questo viene chiamato ad ogni messaggio ricevuto.
		 */
		setDati(
			state,
			action: PayloadAction<{ prezzo: number; variazione: number }>
		) {
			state.prezzo = action.payload.prezzo;
			state.variazione = action.payload.variazione;
		}
	}
});

/**
 * 📤 Export actions
 * -----------------------------------------------------
 * Action creators generati automaticamente da createSlice.
 *
 * Usati da:
 * - Componenti (start/stop)
 * - Middleware (setConnesso, setDati, setDisconnesso)
 */
export const { startSocket, stopSocket, setConnesso, setDisconnesso, setDati } = cryptoSlice.actions;

/**
 * 📦 Export reducer
 * -----------------------------------------------------
 * Viene registrato nello store.
 *
 * Diventa:
 * state.crypto
 */
export default cryptoSlice.reducer;