import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CryptoState {
	symbol: string | null;
	stato: "connesso" | "disconnesso";
	prezzo: number | null;
	variazione: number | null;
}

const initialState: CryptoState = {
	symbol: null,
	stato: "disconnesso",
	prezzo: null,
	variazione: null
};

const cryptoSlice = createSlice({
	name: "crypto",
	initialState,
	reducers: {
		startSocket(state, action: PayloadAction<string>) {
			state.symbol = action.payload
		},
		stopSocket(state) {
			state.symbol = null;
			state.stato = "disconnesso";
			state.prezzo = null;
			state.variazione = null;
		},
		setConnesso(state) {
			state.stato = "connesso";
		},
		setDisconnesso(state) {
			state.stato = "disconnesso";
		},
		setDati(
			state,
			action: PayloadAction<{ prezzo: number; variazione: number }>
		) {
			state.prezzo = action.payload.prezzo;
			state.variazione = action.payload.variazione;
		}
	}
});

export const { startSocket, stopSocket, setConnesso, setDisconnesso, setDati } = cryptoSlice.actions;

export default cryptoSlice.reducer;