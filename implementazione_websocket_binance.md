# Redux Toolkit + WebSocket Middleware

## Guida completa: architettura, flusso e decisioni tecniche

---

## Indice

1. [Il problema che stiamo risolvendo](#1-il-problema-che-stiamo-risolvendo)
2. [Le tecnologie coinvolte](#2-le-tecnologie-coinvolte)
3. [La struttura del progetto](#3-la-struttura-del-progetto)
4. [Lo Store Redux: il cervello centrale](#4-lo-store-redux-il-cervello-centrale)
5. [Lo Slice: stato + azioni in un posto solo](#5-lo-slice-stato--azioni-in-un-posto-solo)
6. [Il Middleware: dove vivono i side-effects](#6-il-middleware-dove-vivono-i-side-effects)
7. [Il Componente: solo UI, zero logica](#7-il-componente-solo-ui-zero-logica)
8. [Il flusso completo end-to-end](#8-il-flusso-completo-end-to-end)
9. [Gestione degli errori e retry](#9-gestione-degli-errori-e-retry)
10. [Quando usare cosa: guida decisionale](#10-quando-usare-cosa-guida-decisionale)
11. [Pattern applicabili a scenari futuri](#11-pattern-applicabili-a-scenari-futuri)

---

## 1. Il problema che stiamo risolvendo

Immagina di dover mostrare il prezzo di Bitcoin in tempo reale. Hai due approcci possibili.

**Approccio naïve (sbagliato):**

```
Componente React
    └── apre WebSocket direttamente
    └── gestisce stato locale
    └── fa retry da solo
    └── si distrugge quando l'utente naviga via → leak!
```

**Approccio architetturale (quello implementato):**

```
Componente React         (solo UI, legge stato)
       ↓ dispatch
Redux Store              (fonte di verità unica)
       ↓ middleware
WebSocket Manager        (ciclo di vita controllato)
       ↓ dispatch
Redux Store              (aggiorna stato con dati realtime)
```

Il problema fondamentale è che **i WebSocket sono side-effects stateful**. Non sono semplici chiamate HTTP che fanno richiesta → risposta. Una connessione WebSocket:

- Vive per minuti o ore
- Sopravvive alla navigazione tra pagine
- Richiede cleanup esplicito
- Può disconnettersi e richiedere retry
- Deve esistere in un'unica istanza

React è ottimo per la UI, ma non è il posto giusto per gestire connessioni longeve. Redux, con il suo sistema di middleware, è esattamente il posto giusto.

---

## 2. Le tecnologie coinvolte

### React

Framework UI. In questo progetto fa **solo** rendering e gestione degli eventi utente. Non tocca WebSocket, non gestisce retry, non conosce Binance.

### Redux Toolkit (RTK)

Libreria di state management. Versione moderna e semplificata di Redux. Fornisce:

- `createSlice` → crea reducer + action creators in un colpo solo
- `configureStore` → configura lo store con sane impostazioni di default
- Immer integrato → permette sintassi "mutativa" nei reducer (sicura)

### Redux Middleware

Il middleware è una funzione che si inserisce nella pipeline tra il `dispatch` di un'action e l'arrivo al reducer. È il punto perfetto per intercettare azioni e fare side-effects (WebSocket, fetch API, logging, analytics).

### WebSocket API (nativa del browser)

API standard per connessioni bidirezionali persistenti. Binance la espone sul suo streaming server. Nessuna libreria esterna richiesta.

### React Router

Gestisce la navigazione. La rotta `/crypto` carica il componente `CryptoLive` in lazy loading (ottimizzazione: il codice viene scaricato solo quando necessario).

---

## 3. La struttura del progetto

```
src/
├── store.ts                          ← Configurazione store globale
├── slices/
│   └── cryptoslice.ts                ← Stato + azioni del dominio crypto
├── middlewares/
│   └── cryptoMiddleware.ts           ← Logica WebSocket (side-effects)
└── pages/
    └── CryptoLive.tsx                ← UI componente
```

Questa struttura riflette una separazione precisa delle responsabilità:

| File                  | Responsabilità | Conosce WebSocket? | Conosce la UI? |
| --------------------- | -------------- | ------------------ | -------------- |
| `store.ts`            | Assemblaggio   | No                 | No             |
| `cryptoslice.ts`      | Stato + azioni | No                 | No             |
| `cryptoMiddleware.ts` | Side-effects   | Sì                 | No             |
| `CryptoLive.tsx`      | Rendering      | No                 | Sì             |

---

## 4. Lo Store Redux: il cervello centrale

### Cos'è

Lo store è l'**unica fonte di verità** dell'intera applicazione. È un oggetto JavaScript che contiene tutto lo stato dell'app, espone metodi per leggerlo e aggiornarlo, e notifica i subscriber quando cambia.

### Come viene creato

```typescript
export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cryptoMiddleware),
});
```

`configureStore` fa molte cose automaticamente:

- Abilita Redux DevTools (strumento browser per debug)
- Aggiunge `redux-thunk` (gestione di async actions base)
- Aggiunge `serializability-check` (avvisa se metti oggetti non serializzabili nello stato)
- Aggiunge `immutability-check` (avvisa se muti lo stato direttamente)

### La struttura dello stato risultante

```
store.getState() =
{
  crypto: {
    symbol: "btcusdt" | null,
    stato: "connesso" | "disconnesso",
    prezzo: 67432.10 | null,
    variazione: 2.34 | null,
    errore: "..." | null
  }
}
```

### I tipi esportati

```typescript
export type RootState = ReturnType<typeof store.getState>;
// → { crypto: CryptoState }

export type AppDispatch = typeof store.dispatch;
// → funzione typed per dispatch
```

`RootState` è cruciale: permette a TypeScript di sapere esattamente che forma ha lo stato quando usi `useSelector`.

### Pipeline di un dispatch

```
dispatch(action)
    │
    ▼
Middleware 1 (redux-thunk)
    │
    ▼
Middleware 2 (serializability-check)
    │
    ▼
Middleware 3 (cryptoMiddleware)  ← il nostro
    │
    ▼
Reducer (cryptoReducer)
    │
    ▼
Nuovo stato nello store
    │
    ▼
React re-render dei componenti abbonati
```

**Ogni middleware** decide se passare l'action al successivo (`next(action)`) o fermarla. Il nostro middleware lascia sempre passare (`const result = next(action)`) e poi reagisce ai side-effects dopo.

---

## 5. Lo Slice: stato + azioni in un posto solo

### Cos'è uno slice

Uno "slice" in Redux Toolkit è una porzione dello stato globale, insieme alle sue azioni e al suo reducer, definiti in un unico posto. Prima di RTK, questi tre elementi erano separati in file diversi.

### L'interfaccia dello stato

```typescript
interface CryptoState {
  symbol: string | null; // Es: "btcusdt"
  stato: "connesso" | "disconnesso";
  prezzo: number | null;
  variazione: number | null;
  errore?: string | null;
}
```

Ogni campo ha un motivo preciso:

| Campo        | Tipo             | Scopo                                                                    |
| ------------ | ---------------- | ------------------------------------------------------------------------ |
| `symbol`     | `string \| null` | Fonte di verità del simbolo attivo. null = nessuna connessione richiesta |
| `stato`      | union type       | Usato dalla UI per mostrare badge connesso/disconnesso                   |
| `prezzo`     | `number \| null` | Dato realtime dal WebSocket. null = non ancora ricevuto                  |
| `variazione` | `number \| null` | Variazione % 24h. null = non ancora ricevuto                             |
| `errore`     | `string \| null` | Messaggio di errore da mostrare all'utente                               |

### Le azioni e cosa fanno ai reducer

**`startSocket(symbol: string)`**

```
Prima: { symbol: null, stato: "disconnesso", ... }
Dopo:  { symbol: "btcusdt", stato: "disconnesso", ... }
```

_Solo_ aggiorna il symbol. Non apre nessun WebSocket. Quello è compito del middleware.

**`stopSocket()`**

```
Prima: { symbol: "btcusdt", stato: "connesso", prezzo: 67000, variazione: 2.1 }
Dopo:  { symbol: null, stato: "disconnesso", prezzo: null, variazione: null }
```

Reset completo. Il middleware intercetta questa azione e chiude il WebSocket.

**`setConnesso()`**

```
Prima: { stato: "disconnesso", ... }
Dopo:  { stato: "connesso", ... }
```

Chiamata dal middleware quando WebSocket.onopen scatta.

**`setDisconnesso()`**

```
Prima: { stato: "connesso", ... }
Dopo:  { stato: "disconnesso", ... }
```

Chiamata dal middleware quando WebSocket.onclose scatta.

**`setDati({ prezzo, variazione })`**

```
Prima: { prezzo: null, variazione: null, ... }
Dopo:  { prezzo: 67432.10, variazione: 2.34, ... }
```

Chiamata dal middleware ad ogni messaggio WebSocket ricevuto. Può scattare decine di volte al secondo.

**`setErrore(messaggio: string)`**

```
Prima: { errore: null, ... }
Dopo:  { errore: "⚠️ Nessun dato ricevuto, symbol probabilmente invalido", ... }
```

### Perché Immer permette la sintassi "mutativa"

Nei reducer Redux classici, non si poteva mai mutare lo stato:

```typescript
// SBAGLIATO Redux classico
state.prezzo = action.payload.prezzo; // ← mutazione!

// CORRETTO Redux classico
return { ...state, prezzo: action.payload.prezzo };
```

Con Redux Toolkit (che usa Immer sotto il cofano), la sintassi mutativa è sicura:

```typescript
setDati(state, action) {
  state.prezzo = action.payload.prezzo;     // ← Immer intercetta e crea nuovo oggetto
  state.variazione = action.payload.variazione;
}
```

Immer lavora con un "draft" dello stato. Quando il reducer finisce, Immer confronta il draft con l'originale e produce un nuovo oggetto immutabile. Tu scrivi codice leggibile, lui garantisce l'immutabilità.

---

## 6. Il Middleware: dove vivono i side-effects

### Cos'è un middleware Redux

Un middleware è una funzione con questa firma specifica:

```typescript
const mioMiddleware: Middleware = (store) => (next) => (action) => {
  // Prima del reducer
  const result = next(action); // ← passa l'action al prossimo middleware/reducer
  // Dopo il reducer
  return result;
};
```

Questa struttura "curried" (funzione che ritorna funzione che ritorna funzione) è il pattern standard Redux. Ogni livello ha accesso a:

- `store` → per leggere lo stato (`store.getState()`) e dispatchare (`store.dispatch()`)
- `next` → per passare l'action al prossimo nella pipeline
- `action` → l'action dispatchata

### Lo stato interno del middleware (closure)

```typescript
export const cryptoMiddleware: Middleware = (store) => {
  // Queste variabili vivono nella closure
  let ws: WebSocket | null = null;
  let currentSymbol: string | null = null;
  let retryTimeout: any = null;
  let tentativi = 0;
  let inactivityTimeout: any = null;

  return (next) => (action) => { ... }
}
```

**Perché non mettere queste variabili nello store Redux?**

Perché non devono causare re-render. Se il WebSocket fosse nello store Redux, ogni aggiornamento del socket triggererebbe un re-render di tutti i componenti abbonati. Queste sono variabili tecniche, non stato UI.

Regola: **se non deve triggerare render, non va nello store**.

| Variabile           | Tipo              | Perché qui e non nello store                                       |
| ------------------- | ----------------- | ------------------------------------------------------------------ |
| `ws`                | Oggetto WebSocket | Non serializzabile, non visibile all'utente                        |
| `currentSymbol`     | string            | Copia locale per confronto; lo store ha la versione "intenzionale" |
| `retryTimeout`      | Timer ID          | Dettaglio tecnico, utile solo per cancellarlo                      |
| `tentativi`         | number            | Contatore tecnico, non interessa all'utente                        |
| `inactivityTimeout` | Timer ID          | Dettaglio tecnico                                                  |

### La funzione `connect()` e il suo ciclo di vita

```
connect() viene chiamata
    │
    ▼
Crea new WebSocket(url)
    │
    ├── onopen  → dispatch(setConnesso())
    │             avvia inactivityTimeout (3s)
    │
    ├── onmessage → dispatch(setDati({prezzo, variazione}))
    │               cancella inactivityTimeout
    │
    ├── onerror → ws.close() [onclose gestirà il retry]
    │
    └── onclose → dispatch(setDisconnesso())
                  se currentSymbol è null → STOP (no retry)
                  altrimenti → schedula connect() con backoff
```

### Il retry con exponential backoff

```typescript
const delay = Math.min(1000 * 2 ** tentativi, 30000);
```

| Tentativo | Formula                 | Delay            |
| --------- | ----------------------- | ---------------- |
| 0         | 1000 \* 2^0             | 1 secondo        |
| 1         | 1000 \* 2^1             | 2 secondi        |
| 2         | 1000 \* 2^2             | 4 secondi        |
| 3         | 1000 \* 2^3             | 8 secondi        |
| 4         | 1000 \* 2^4             | 16 secondi       |
| 5+        | min(1000 \* 2^5, 30000) | 30 secondi (cap) |

Questo evita di bombardare il server con riconnessioni continue. Se il server è down, aspetti sempre di più. Il cap a 30 secondi garantisce che prima o poi riprovi.

### Il rilevamento di symbol invalidi

```typescript
ws.onopen = () => {
  store.dispatch(setConnesso());
  inactivityTimeout = setTimeout(() => {
    store.dispatch(
      setErrore("⚠️ Nessun dato ricevuto, symbol probabilmente invalido"),
    );
    store.dispatch(setDisconnesso());
    ws?.close();
  }, 3000);
};

ws.onmessage = (event) => {
  // ...
  clearTimeout(inactivityTimeout); // ← cancella il timer se arriva un messaggio
  inactivityTimeout = null;
};
```

Binance si connette anche per symbol invalidi (non rifiuta la connessione). La differenza è che non manda mai messaggi. Dopo 3 secondi di silenzio, assumiamo che il symbol non esista.

---

## 7. Il Componente: solo UI, zero logica

### Principio "thin component"

```typescript
export default function CryptoLive() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("btcusdt"); // ← stato locale UI

  const { stato, prezzo, variazione } = useSelector(
    (state: RootState) => state.crypto,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(startSocket(input)); // ← parla con Redux, non con WebSocket
  };

  const handleStop = () => {
    dispatch(stopSocket()); // ← parla con Redux, non con WebSocket
  };

  // ... render basato sullo stato
}
```

Il componente non sa che esiste un WebSocket. Non sa di Binance. Non sa dei retry. Fa solo tre cose:

1. **Legge stato** da Redux con `useSelector`
2. **Dispatcha azioni** con `useDispatch`
3. **Renderizza** basandosi sullo stato letto

### Stato locale vs stato globale

```typescript
const [input, setInput] = useState("btcusdt");
```

`input` è stato **locale** perché:

- È temporaneo (valore dell'input che l'utente sta digitando)
- Nessun altro componente ne ha bisogno
- Non sopravvive alla navigazione (e non deve)

```typescript
const { stato, prezzo, variazione } = useSelector(...)
```

Questi sono stato **globale** perché:

- Provengono dal WebSocket (side-effect esterno)
- Potrebbero servire ad altri componenti (es. un header con indicatore di connessione)
- Devono sopravvivere alla navigazione tra pagine

### La criticità del `type="button"`

```jsx
<button type="submit">🟢 Avvia</button>
<button type="button" onClick={handleStop}>🛑 Stop</button>
```

Senza `type="button"`, il bottone Stop in un form HTML avrebbe comportamento `type="submit"` di default, causando un submit del form alla pressione. Il risultato sarebbe: premere Stop → il form fa submit → si avvia il socket invece di fermarlo. Un bug classico e sottile.

---

## 8. Il flusso completo end-to-end

### Scenario: l'utente avvia il socket

```
[Utente digita "ethusdt" e preme Avvia]
         │
         ▼
CryptoLive: dispatch(startSocket("ethusdt"))
         │
         ▼
Redux pipeline: action { type: "crypto/startSocket", payload: "ethusdt" }
         │
         ▼
cryptoMiddleware intercetta:
  - action.type === startSocket.type ✓
  - currentSymbol !== "ethusdt" → ok, procedi
  - chiudi eventuale ws precedente
  - currentSymbol = "ethusdt"
  - tentativi = 0
  - chiama connect()
         │
         ▼
next(action) → cryptoReducer:
  state.symbol = "ethusdt"
         │
         ▼
Store aggiornato: { symbol: "ethusdt", stato: "disconnesso", ... }
         │
         ▼
connect() apre WebSocket su Binance
         │
         ▼
ws.onopen scatta:
  dispatch(setConnesso()) → stato: "connesso"
  avvia inactivityTimeout (3s)
         │
         ▼
Store: { symbol: "ethusdt", stato: "connesso", ... }
CryptoLive re-render: mostra "Stato: connesso"
         │
         ▼
ws.onmessage scatta (ogni ~1 secondo):
  clearTimeout(inactivityTimeout)
  dispatch(setDati({ prezzo: 3200.50, variazione: -1.2 }))
         │
         ▼
Store: { prezzo: 3200.50, variazione: -1.2, ... }
CryptoLive re-render: mostra prezzo e variazione
```

### Scenario: l'utente preme Stop

```
[Utente preme Stop]
         │
         ▼
CryptoLive: dispatch(stopSocket())
         │
         ▼
cryptoMiddleware intercetta:
  - action.type === stopSocket.type ✓
  - currentSymbol = null (segnala stop intenzionale)
  - clearTimeout(retryTimeout) (blocca eventuali retry schedulati)
  - ws.close()
  - ws = null
         │
         ▼
next(action) → cryptoReducer:
  state.symbol = null
  state.stato = "disconnesso"
  state.prezzo = null
  state.variazione = null
         │
         ▼
ws.onclose scatta:
  dispatch(setDisconnesso()) [già disconnesso, ma ok]
  controlla currentSymbol → è null → stop manuale → NO retry
         │
         ▼
Store: { symbol: null, stato: "disconnesso", prezzo: null, variazione: null }
CryptoLive re-render: UI resettata
```

### Scenario: connessione cade accidentalmente

```
[Internet va giù o server Binance cade]
         │
         ▼
ws.onerror scatta:
  ws.close()
         │
         ▼
ws.onclose scatta:
  dispatch(setDisconnesso())
  currentSymbol !== null → non è stop manuale
  delay = min(1000 * 2^0, 30000) = 1000ms
  tentativi++
  retryTimeout = setTimeout(connect, 1000)
         │
         ▼
Dopo 1 secondo: connect() richiamata
[se fallisce ancora: delay 2s, poi 4s, poi 8s, ...]
```

---

## 9. Gestione degli errori e retry

### Mappa degli stati di errore

```
STATI POSSIBILI:
┌─────────────┐     startSocket      ┌──────────────┐
│ disconnesso │ ──────────────────── │  connettendo  │
└─────────────┘                      └──────┬───────┘
       ▲                                    │ onopen
       │ onclose (stop manuale)      ┌──────▼───────┐
       │                             │   connesso   │
       └──── stopSocket ─────────────└──────┬───────┘
                                            │ onclose (accidentale)
                                     ┌──────▼───────┐
                                     │  retry loop  │
                                     └──────────────┘
```

### Il problema del symbol invalido

Binance non rifiuta connessioni per symbol inesistenti. La connessione si apre (`onopen`), ma non arriva mai nessun messaggio. Senza il meccanismo di inactivity timeout, l'app mostrerebbe "Stato: connesso" ma senza prezzi, in modo silenzioso e confuso.

La soluzione:

```
onopen → avvia timer 3s
    └── se scade (nessun messaggio) → setErrore + setDisconnesso + ws.close()
    └── se arriva messaggio → clearTimeout (tutto ok)
```

### Perché `ws.onerror` non gestisce il retry

```typescript
ws.onerror = () => {
  ws?.close(); // ← solo questo
};
```

Perché? Perché dopo un `onerror`, `onclose` scatterà **sempre** automaticamente. Quindi il retry viene gestito interamente in `onclose`, evitando logica duplicata.

---

## 10. Quando usare cosa: guida decisionale

### Stato locale React (`useState`) vs stato globale Redux

```
DOMANDA: Chi ha bisogno di questo dato?

Solo questo componente?
    └── useState ✓

Più componenti? O sopravvive alla navigazione?
    └── Redux ✓

DOMANDA: Questo dato deve triggerare render?

Sì (es. prezzo da mostrare)
    └── Redux store ✓

No (es. oggetto WebSocket, timer ID)
    └── Closure del middleware / useRef ✓
```

### Dove mettere la logica

```
TIPO DI LOGICA              DOVE VA

Rendering condizionale   → Componente React
Gestione form locale     → Componente React con useState
Trasformazione dati UI   → Componente React o selector

Stato condiviso tra      → Redux slice
  più componenti

Chiamate API (fetch)     → Redux Thunk o RTK Query
WebSocket / SSE          → Redux Middleware
Logica asincrona         → Redux Middleware o Thunk
  complessa
```

### Quando usare middleware vs thunk

**Redux Thunk** (già incluso in RTK) è ideale per:

- Singola chiamata API
- Logica asincrona semplice: fetch → dispatch risultato
- Nessuno stato persistente tra chiamate

```typescript
// Thunk: fetch singolo
const fetchUser = (id) => async (dispatch) => {
  const user = await api.getUser(id);
  dispatch(setUser(user));
};
```

**Middleware custom** è ideale per:

- Connessioni persistenti (WebSocket, SSE)
- Stato interno che non deve essere nello store
- Logica che reagisce a multiple azioni diverse
- Retry/backoff automatico

```typescript
// Middleware: WebSocket persistente
// → ha bisogno di ws, currentSymbol, tentativi in closure
// → reagisce a startSocket E stopSocket
// → gestisce retry automaticamente
```

---

## 11. Pattern applicabili a scenari futuri

### Pattern 1: Sostituire Binance con qualsiasi altro WebSocket

Il middleware è completamente isolato. Per connettersi a un altro provider:

1. Cambia solo la URL in `connect()`
2. Aggiusta il parsing in `onmessage`
3. Il resto (retry, stop, stato) rimane identico

```typescript
// Binance
const url = `wss://stream.binance.com:9443/ws/${symbol}@ticker`;
const prezzo = parseFloat(data.c);

// Coinbase
const url = `wss://advanced-trade-ws.coinbase.com`;
const prezzo = parseFloat(data.price);
```

### Pattern 2: Multiple connessioni contemporanee

Se hai bisogno di ascoltare più symbol contemporaneamente, la closure può diventare una Map:

```typescript
let connections: Map<string, WebSocket> = new Map();

// startSocket("btcusdt") → connections.set("btcusdt", ws)
// startSocket("ethusdt") → connections.set("ethusdt", ws)
// stopSocket("btcusdt")  → connections.get("btcusdt").close()
```

### Pattern 3: Server-Sent Events (SSE)

Stesso pattern, diversa API:

```typescript
let eventSource: EventSource | null = null;

// In connect():
eventSource = new EventSource(`https://api.example.com/stream/${symbol}`);
eventSource.onmessage = (event) => {
  // stesso dispatch di prima
};
eventSource.onerror = () => {
  // stesso retry di prima
};

// In stopSocket:
eventSource?.close();
eventSource = null;
```

### Pattern 4: Middleware per chiamate API con cache

```typescript
export const apiMiddleware: Middleware = (store) => {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return (next) => (action) => {
    if (action.type === fetchData.type) {
      const cached = cache.get(action.payload);
      if (cached && Date.now() - cached.timestamp < 60000) {
        store.dispatch(setData(cached.data));
        return next(action);
      }
      fetch(`/api/${action.payload}`)
        .then((r) => r.json())
        .then((data) => {
          cache.set(action.payload, { data, timestamp: Date.now() });
          store.dispatch(setData(data));
        });
    }
    return next(action);
  };
};
```

### Pattern 5: Middleware per logging/analytics

```typescript
export const analyticsMiddleware: Middleware =
  (store) => (next) => (action) => {
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();

    // Traccia ogni cambio di stato
    analytics.track(action.type, {
      prev: prevState,
      next: nextState,
      payload: action.payload,
    });

    return result;
  };
```

---

## Riepilogo visivo finale

```
                    ┌─────────────────────────────────────────────┐
                    │              APPLICAZIONE REACT              │
                    │                                              │
                    │  ┌──────────────────────────────────────┐   │
                    │  │          CryptoLive Component         │   │
                    │  │                                      │   │
                    │  │  UI ──────────────── legge stato     │   │
                    │  │   │                      ▲           │   │
                    │  │   │ dispatch              │           │   │
                    │  └───┼───────────────────────┼───────────┘   │
                    │      │                       │               │
                    │      ▼                       │               │
                    │  ┌───────────────────────────────────────┐   │
                    │  │             REDUX STORE                │   │
                    │  │  { crypto: { symbol, stato,           │   │
                    │  │             prezzo, variazione } }    │   │
                    │  └───────────────────────────────────────┘   │
                    │      │                       ▲               │
                    │      │ pipeline middleware   │ dispatch       │
                    │      ▼                       │               │
                    │  ┌───────────────────────────────────────┐   │
                    │  │         CRYPTO MIDDLEWARE              │   │
                    │  │                                       │   │
                    │  │  closure: ws, symbol, retry, timer    │   │
                    │  │                                       │   │
                    │  │  startSocket → connect()              │   │
                    │  │  stopSocket  → ws.close()             │   │
                    │  └────────────────────┬──────────────────┘   │
                    └───────────────────────┼─────────────────────┘
                                            │ WebSocket
                                            ▼
                    ┌─────────────────────────────────────────────┐
                    │        BINANCE WEBSOCKET SERVER              │
                    │   wss://stream.binance.com:9443/ws/...       │
                    │                                              │
                    │   → manda dati ogni ~1 secondo               │
                    └─────────────────────────────────────────────┘
```

---

_Guida generata da Claude · Versione 1.0_
