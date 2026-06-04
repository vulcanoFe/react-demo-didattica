import { type Middleware } from "@reduxjs/toolkit";
import { setConnesso, setDati, setDisconnesso, startSocket, stopSocket } from "../slices/cryptoslice";

export const cryptoMiddleware: Middleware = (store) => {

	let ws: WebSocket | null = null;
	let currentSymbol: string | null = null;
	let retryTimeout: any = null;
	let tentativi = 0;

	return (next) => (action: any) => {

		// lasciamo passare l'action
		const result = next(action);

		// action START
		if (action.type === startSocket.type) {
			const symbol = action.payload;

			// se esiste già connessione aperta e symbol non è cambiato non apro nuova connessione
			if (currentSymbol === symbol && ws) {
				console.log("⚠️ Socket già attivo per questo symbol");
				return result;
			}

			// se cambia symbol -> chiudo connessione precedente
			if (ws) {
				ws.close();
				ws = null;
			}

			currentSymbol = symbol;
			tentativi = 0;

			connect();
		}

		// action STOP
		if (action.type === stopSocket.type) {

			currentSymbol = null;

			if (retryTimeout) {
				clearTimeout(retryTimeout);
			}

			if (ws) {
				ws.close();
				ws = null;
			}
		}

		return result;

		function connect() {

			if (!currentSymbol) return;

			const url = `wss://stream.binance.com:9443/ws/${currentSymbol.toLowerCase()}@ticker`;
			console.log(`🔌 Connessione a: ${url}`);

			ws = new WebSocket(url);

			// OPEN CONNECTION
			ws.onopen = () => {
				console.log("✅ Connesso");
				store.dispatch(setConnesso());
				tentativi = 0;
			}

			// HANDLE MESSAGE
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);

				store.dispatch(
					setDati({
						prezzo: parseFloat(data.c),
						variazione: parseFloat(data.P)
					})
				);
			};

			// HANDLE ERROR
			ws.onerror = () => {
				ws?.close();
			}

			// CLOSE CONNECTION
			ws.onclose = () => {
				console.log("🔌 Chiuso");

				store.dispatch(setDisconnesso());

				//se stop manuale -> no retry
				if (!currentSymbol) {
					console.log("🛑 STOP manuale");
					return;
				}

				//errore -> retry con backof esponenziale
				const delay = Math.min(1000 * 2 ** tentativi, 30000);
				console.log(`♻️ Retry tra ${delay / 1000}s (tentativo: ${tentativi})`);
				tentativi++;
				retryTimeout = setTimeout(connect, delay);
			};
		}
	}

}