# 🧠 Implementazione WebSocket Binance con Redux Toolkit

## 🎯 Obiettivo
Documentare l'architettura completa dell'integrazione WebSocket Binance basata su:
- React (UI)
- Redux Toolkit (stato)
- Middleware (side-effects)

---

# 🏗️ Architettura generale

```
┌───────────────┐
│   Component   │
│ (CryptoLive)  │
└───────┬───────┘
        │ dispatch
        ▼
┌─────────────────────┐
│   Redux Store       │
│  (cryptoSlice)      │
└───────┬─────────────┘
        │ action intercettata
        ▼
┌─────────────────────┐
│   Middleware        │
│ (WebSocket Engine)  │
└───────┬─────────────┘
        │ dati
        ▼
┌─────────────────────┐
│   Redux Store       │
│ (update stato)      │
└───────┬─────────────┘
        │ selector
        ▼
┌───────────────┐
│   Component   │
│   (render)    │
└───────────────┘
```

---

# 🔄 Flusso completo (step by step)

## 🟢 START SOCKET

1. Utente inserisce "btcusdt"
2. Click su Avvia
3. Dispatch:

```
dispatch(startSocket("btcusdt"))
```

4. Redux aggiorna lo stato:

```
state.crypto.symbol = "btcusdt"
```

5. Middleware intercetta action
6. Apre WebSocket

```
wss://stream.binance.com:9443/ws/btcusdt@ticker
```

7. Evento `onopen`

```
dispatch(setConnesso())
```

---

## 📩 ARRIVO DATI

1. Binance invia dati
2. Middleware li intercetta
3. Trasforma payload:

```
prezzo = data.c
variazione = data.P
```

4. Dispatch:

```
dispatch(setDati(...))
```

5. Redux aggiorna stato
6. Component re-render automatico

---

## 🔴 STOP SOCKET

1. Click su STOP
2. Dispatch:

```
dispatch(stopSocket())
```

3. Middleware:
- cancella timeout
- chiude WebSocket
- blocca retry

4. Stato aggiornato → UI riflette disconnessione

---

## ♻️ RETRY AUTOMATICO

Se connessione cade:

```
1s → 2s → 4s → 8s → ... max 30s
```

Condizione:

```
if (!currentSymbol) → NO retry
```

---

# 🧩 Ruoli dei componenti

## ⚛️ Component (CryptoLive)

Responsabilità:
- input utente
- dispatch azioni
- leggere stato

NON fa:
- logica WebSocket
- retry

---

## 🧠 Slice (cryptoSlice)

Responsabilità:
- stato globale
- azioni

NON fa:
- side effects

---

## ⚙️ Middleware

Responsabilità:
- WebSocket lifecycle
- retry
- gestione errori

---

# ✅ Vantaggi architettura

## 🔹 Separazione responsabilità

- UI pulita
- stato centralizzato
- side-effect isolati

---

## 🔹 Scalabilità

Facile estendere:
- multi crypto
- cache
- grafici

---

## 🔹 Testabilità

- slice testabile facilmente
- middleware isolabile

---

## 🔹 Robustezza

- retry automatico
- gestione errori
- no memory leak

---

# ⚠️ Contro

## ❌ Complessità iniziale

- più file
- più concetti

## ❌ Debug distribuito

- logica sparsa tra layer

---

# 🧠 Conclusione

Questa implementazione segue best practice enterprise:

✅ separazione livelli
✅ controllo side-effect
✅ architettura scalabile

È il modo corretto per gestire WebSocket in applicazioni React complesse.
