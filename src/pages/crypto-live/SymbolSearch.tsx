import axios from "axios";
import { useEffect, useRef, useState } from "react";
import styles from './SymbolSearch.module.css';

type Props = {
	onSelect: (symbol: string) => void;
};

export default function SymbolSearch({ onSelect }: Props) {


	/**
	 * 📝 Stato locale (UI state)
	 * -------------------------------------------------
	 * Questo stato NON è globale perché:
	 * ✅ è temporaneo (input utente)
	 * ✅ non serve ad altri componenti
	 */
	const [input, setInput] = useState("");

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

				const symbols: string[] = res.data.symbols ?? [];

				// filtro lato client TODO AGGIUNGERE FILTRO
				const filtered = symbols
					.filter((s: any) => s.symbol.toLowerCase().includes(
						input.toLowerCase()) &&
						s.quoteAsset === 'USDT' &&
						s.status === 'TRADING'
					)
					.map((s: any) => s.symbol)
					.slice(0, 10);
				console.log(filtered);

				setResults(filtered);
				setShowDropdown(true);
				setSelectedIndex(-1);

			} catch (err) {
				console.error("Errore API Binance", err);
			}
		}, 300);

		// CALLBACK ESEGUITA AL UNMOUNT DEL COMPONENTE
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

			onSelect(selected);
			setShowDropdown(false);
		}
	};

	/**
	 * 🖱️ CLICK SU RISULTATO
	 * -------------------------------------------------
	 * Avvia direttamente la socket
	 */
	const handleSelect = (symbol: string) => {
		setInput(''); //svuoto il campo di input, il symbolo selezionato sarà visibile nella card
		onSelect(symbol);
		setShowDropdown(false);
	};

	return (
		<>
			{/* 
			* 🧾 FORM INPUT
			* --------------------------
			* Permette di inserire il symbol
			*/}
			<div className={styles.searchContainer}>

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
		</>
	)

}