/**
 * 🎯 Redux Store Configuration
 * -----------------------------------------------------
 * Questo file rappresenta il punto centrale di configurazione
 * dello store Redux dell'applicazione.
 *
 * Responsabilità principali:
 * - Registrare i reducer (stato globale)
 * - Configurare i middleware (side-effects)
 * - Esportare i tipi TypeScript globali
 *
 * Questo è il "cervello" dello stato applicativo.
 */

import { configureStore } from "@reduxjs/toolkit";
import cryptoReducer from "./slices/cryptoslice";
import { cryptoMiddleware } from "./middlewares/cryptoMiddleware";

/**
 * 🧠 Creazione dello store Redux
 * -----------------------------------------------------
 * configureStore è la funzione ufficiale di Redux Toolkit
 * che semplifica enormemente la configurazione rispetto
 * al Redux classico.
 *
 * Include automaticamente:
 * ✅ Redux DevTools
 * ✅ Middleware di default (redux-thunk, immutability check, serializability)
 * ✅ Buone pratiche già integrate
 */
export const store = configureStore({

	/**
	 * 📦 Reducers (stato globale)
	 * -------------------------------------------------
	 * Qui registriamo tutti gli slice dell'applicazione.
	 *
	 * Ogni key diventa una "sezione" dello stato globale.
	 *
	 * Esempio struttura finale:
	 * {
	 *   crypto: {
	 *     symbol,
	 *     stato,
	 *     prezzo,
	 *     variazione
	 *   }
	 * }
	 */
	reducer: {
		crypto: cryptoReducer
	},

	/**
	 * ⚙️ Middleware
	 * -------------------------------------------------
	 * I middleware servono per gestire side effects:
	 * - API calls
	 * - WebSocket
	 * - logging
	 * - analytics
	 *
	 * getDefaultMiddleware():
	 * restituisce i middleware base di Redux Toolkit
	 *
	 * .concat(cryptoMiddleware):
	 * aggiunge il nostro middleware custom per la gestione
	 * del WebSocket Binance.
	 *
	 * ✅ Questa è la scelta architetturale corretta:
	 * il WebSocket NON va gestito nei componenti o hook,
	 * ma centralizzato qui.
	 */
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(cryptoMiddleware),
});

/**
 * 🧾 RootState (tipo globale dello stato)
 * -----------------------------------------------------
 * Rappresenta la forma COMPLETA dello stato Redux.
 *
 * Viene inferito automaticamente dallo store.
 *
 * Utilizzo:
 * - useSelector
 * - tipizzazione forte dello stato
 *
 * Esempio:
 * const state = useSelector((state: RootState) => state.crypto);
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * 🚀 AppDispatch (tipo dispatch)
 * -----------------------------------------------------
 * Tipo del dispatch Redux.
 *
 * Utile per:
 * - tipizzare useDispatch()
 * - supportare async actions (thunk)
 * - evitare errori di typing
 *
 * Best practice:
 * creare un hook custom:
 *
 * const dispatch = useAppDispatch();
 */
export type AppDispatch = typeof store.dispatch;