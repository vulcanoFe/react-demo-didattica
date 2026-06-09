import styles from './CryptoCard.module.css';

type Props = {
	stato: string;
	prezzo: number | null;
	variazione: number | null;
	symbol: string | null;
	onStop: () => void;
};

export default function CryptoCard({
	stato,
	prezzo,
	variazione,
	symbol,
	onStop
}: Props) {

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
		<>
			{/* 
			* 📊 DATA DISPLAY
			* --------------------------
			* Render basato su stato Redux
			*/}
			<div className={`${styles.cryptoDataRow}`}>
				<div className={`${styles.cryptoDataCard} ${trendClass}`}>
					<p><strong>Symbol:</strong> {symbol ?? "-"}</p>
					<p>Stato: {stato} <span>{stato === 'connesso' ? '🟢' : '🛑'}</span></p>
					<p>Prezzo: {prezzo}</p>
					<p>Variazione 24h: {variazione}%</p>
					<button type="button" onClick={onStop} className={styles.stopBtn}>Stop</button>
				</div>
			</div>
		</>
	);

}
