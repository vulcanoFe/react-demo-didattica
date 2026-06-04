import { configureStore } from "@reduxjs/toolkit";
import cryptoReducer from "./slices/cryptoslice";
import { cryptoMiddleware } from "./middlewares/cryptoMiddleware";

export const store = configureStore({
	reducer: {
		crypto: cryptoReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(cryptoMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;