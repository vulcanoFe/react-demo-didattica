import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startSocket, stopSocket } from "../slices/cryptoslice";
import type { RootState } from "../store";

export default function CryptoLive() {

	const dispatch = useDispatch();

	const [input, setInput] = useState("btcusdt");

	//uso selector
	const { stato, prezzo, variazione } = useSelector((state: RootState) => state.crypto);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		dispatch(startSocket(input));
	}

	const handleStop = () => {
		dispatch(stopSocket());
	};

	return (
		<div>
			<h2>📈 Crypto Live</h2>

			<form onSubmit={handleSubmit}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="es: btcusdt"
				/>
				<button type="submit">🟢 Avvia</button>
				<button type="button" onClick={handleStop}>🛑 Stop</button>
			</form>


			<hr />

			<p>Stato: {stato}</p>
			<p>Prezzo: {prezzo}</p>
			<p>Variazione 24h: {variazione}%</p>
		</div>
	)

}