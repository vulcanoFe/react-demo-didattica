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

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startSocket, stopSocket } from "../slices/cryptoslice";
import type { RootState } from "../store";
import styles from "./CryptoLive.module.css";
import axios from "axios";

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
	 */
	const [input, setInput] = useState("");

	/**
	 * 🪙 Symbol attivo
	 * -------------------------------------------------
	 * Rappresenta il simbolo attualmente selezionato
	 * e usato nella connessione WebSocket
	 */
	const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

	/**
	 * 🔎 Stato autocomplete
	 * -------------------------------------------------
	 * - results → lista risultati API
	 * - showDropdown → controlla visibilità tendina
	 * - selectedIndex → indice evidenziato (keyboard nav)
	 */
	const [results, setResults] = useState<string[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	/**
	 * ⏱️ Debounce timer
	 * -------------------------------------------------
	 * Serve per ritardare la chiamata API di 300ms
	 */
	const debounceRef = useRef<number | null>(null);

	/**
 * 🌐 AUTOCOMPLETE BINANCE API
 * -------------------------------------------------
 * Parte dopo 300ms dall'ultima digitazione
 *
 * Flusso:
 * input → debounce → chiamata API → risultati filtrati
 */
	useEffect(() => {
		if (!input) {
			setResults([]);
			setShowDropdown(false);
			return;
		}

		// reset timer precedente
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = window.setTimeout(async () => {
			try {
				// API Binance exchangeInfo (tutti i simboli)
				const res = await axios.get("https://api.binance.com/api/v3/exchangeInfo");

				const symbols: string[] = res.data.symbols.map((s: any) => s.symbol.toLowerCase());

				// filtro lato client
				const filtered = symbols.filter((s) => s.includes(input.toLowerCase())).slice(0, 10);

				setResults(filtered);
				setShowDropdown(true);
				setSelectedIndex(-1);

			} catch (err) {
				console.error("Errore API Binance", err);
			}
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};

	}, [input]);

	/**
 * ⌨️ KEYBOARD NAVIGATION
 * -------------------------------------------------
 * - Freccia giù → selezione successiva
 * - Freccia su → selezione precedente
 * - INVIO → conferma selezione
 */
	const handleKeyDown = (e: React.KeyboardEvent) => {

		if (!showDropdown) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, 0));
		}

		if (e.key === "Enter") {
			e.preventDefault();

			const selected = selectedIndex >= 0 ? results[selectedIndex] : input;

			setActiveSymbol(selected);
			dispatch(startSocket(selected));
			setShowDropdown(false);
		}
	};

	/**
 * 🖱️ CLICK SU RISULTATO
 * -------------------------------------------------
 * Avvia direttamente la socket
 */
	const handleSelect = (symbol: string) => {
		setInput(symbol);
		setActiveSymbol(symbol);
		dispatch(startSocket(symbol));
		setShowDropdown(false);
	};

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
		setInput('');
		setActiveSymbol('');
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
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.formField}>

					<label htmlFor="symbol" className={styles.label}>
						Symbol
					</label>

					<input
						id="symbol"
						name="symbol"
						type="text"
						value={input}
						className={styles.input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="es: btcusdt"
					/>

					{/*
					* 📋 DROPDOWN AUTOCOMPLETE
					* --------------------------
					* Mostra risultati o fallback "Nessun risultato"
					*/}
					{showDropdown && (
						<ul className={styles.dropdown}>
							{results.length === 0 && (
								<li className={styles.noResult}>Nessun risultato</li>
							)}

							{results.map((r, i) => (
								<li
									key={r}
									className={`${styles.item} ${i === selectedIndex ? styles.active : ""}`}
									onClick={() => handleSelect(r)}
								>
									{r}
								</li>
							))}
						</ul>
					)}
				</div>

			</form>

			<hr />

			{/* 
			* 📊 DATA DISPLAY
			* --------------------------
			* Render basato su stato Redux
			*/}
			<div className={`${styles.cryptoDataRow}`}>
				<div className={`${styles.cryptoDataCard} ${trendClass}`}>
					<p><strong>Symbol:</strong> {activeSymbol ?? "-"}</p>
					<p>Stato: {stato} <span>{stato === 'connesso' ? '🟢' : '🛑'}</span></p>
					<p>Prezzo: {prezzo}</p>
					<p>Variazione 24h: {variazione}%</p>
					<button type="button" onClick={handleStop} className={styles.cancelBtn}>Stop</button>
				</div>
			</div>
		</div>
	)
}