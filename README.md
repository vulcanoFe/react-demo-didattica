# react-demo-didattica

Laboratorio interattivo per imparare React esplorando i pattern fondamentali del framework. Ogni pagina è un esempio pratico; ogni file sorgente è una lezione con commenti che spiegano il _perché_ di ogni scelta, non solo il _cosa_.

---

## Come usare questo progetto

1. **Naviga una pagina** nell'app e osserva il comportamento nell'interfaccia.
2. **Apri il file sorgente** corrispondente in `src/pages/` o `src/components/`.
3. **Leggi i commenti** — ogni sezione spiega il concetto, i vantaggi, gli svantaggi e le alternative.
4. **Modifica il codice** e osserva cosa cambia. Vite aggiorna istantaneamente grazie all'HMR.

> 💡 Apri la console del browser (F12) mentre navighi: i log di lifecycle, render e state change sono visibili in tempo reale.

---

## Avvio rapido

```bash
npm install
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`.

---

## Concetti esplorati

| Pagina       | Concetto                                              | File chiave                                                                                          |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`          | Lifecycle & Hooks (`useState`, `useEffect`, `useRef`) | `src/pages/Home.tsx`                                                                                 |
| `/form`      | Controlled vs Uncontrolled inputs                     | `src/pages/FormDemo.tsx`, `src/components/ControlledForm.tsx`, `src/components/UncontrolledForm.tsx` |
| `/accordion` | Compound Components + Context                         | `src/components/Accordion/Accordion.tsx`                                                             |

---

## Come funziona Vite

Vite è il **build tool** che trasforma il codice TypeScript/JSX in JavaScript comprensibile dal browser. È radicalmente più veloce dei tool precedenti (Webpack, Create React App) per un motivo architetturale preciso.

### Modalità sviluppo — `npm run dev`

Vite **non costruisce un bundle** in sviluppo. Sfrutta i moduli ES nativi del browser (`type="module"`): ogni file viene servito direttamente, trasformato solo quando il browser lo richiede.

- **Avvio istantaneo** — non deve raggruppare tutti i file prima di partire. Il server è pronto in meno di un secondo anche su progetti grandi.
- **HMR ultrarapido** (Hot Module Replacement) — quando modifichi un file, Vite aggiorna _solo quel modulo_ nel browser senza ricaricare la pagina. Lo state React viene preservato.
- **Trasformazione on demand** — il browser risolve le importazioni modulo per modulo, Vite le trasforma al volo usando **Oxc** (un compilatore scritto in Rust, ordini di grandezza più veloce di Babel).

> **Perché i tool precedenti erano lenti?** Webpack doveva costruire l'intero grafo delle dipendenze e creare un bundle _prima_ di avviare il server. Con 1000 moduli: decine di secondi di attesa. Vite inverte la logica: parte subito e trasforma i file _on demand_.

### Build per produzione — `npm run build`

In produzione i moduli ES nativi non bastano: il browser dovrebbe fare centinaia di richieste HTTP separate, il che è lento su una rete reale. Qui Vite usa **Rollup** per creare un bundle ottimizzato.

```bash
npm run build    # Crea la cartella dist/
npm run preview  # Anteprima locale del bundle di produzione
```

Il processo in dettaglio:

1. **`tsc -b`** — TypeScript controlla i tipi e segnala eventuali errori _prima_ che Vite tocchi il codice.
2. **Rollup bundling** — tutti i moduli vengono raggruppati in pochi file.
3. **Tree-shaking** — il codice non usato viene eliminato. Se importi solo `useState` da React, il resto della libreria non finisce nel bundle.
4. **Code splitting** — il bundle viene diviso in chunk. Le pagine vengono caricate solo quando l'utente le visita (lazy loading).
5. **Minificazione** — variabili rinominate, spazi rimossi, output compresso. Il bundle finale è una frazione del sorgente.

---

## Struttura del progetto

```
src/
├── components/              # Componenti riutilizzabili
│   ├── Accordion/           # Pattern Compound Components
│   │   ├── Accordion.tsx        # Root + sotto-componenti (Item, Header, Panel)
│   │   ├── Accordion.module.css
│   │   ├── AccordionContext.ts   # createContext + tipo del context
│   │   └── useAccordion.ts      # Custom hook per consumare il context
│   ├── ControlledForm.tsx   # Form con value + onChange (React controlla)
│   └── UncontrolledForm.tsx # Form con ref (DOM controlla)
├── hooks/                   # Custom hooks riutilizzabili
│   ├── useForm.ts           # Gestione valori, errori, submit per form controlled
│   └── useLifecycleLogger.ts
├── pages/                   # Una pagina = un concetto
│   ├── About.tsx            # Questa pagina
│   ├── About.module.css
│   ├── FormDemo.tsx         # Controlled vs Uncontrolled a confronto
│   └── FormDemo.module.css
├── index.css                # Variabili CSS globali + reset + dark mode
└── main.tsx                 # Entry point, configurazione router
```

---

## Stack tecnologico

| Libreria          | Versione | Ruolo                                              |
| ----------------- | -------- | -------------------------------------------------- |
| React             | 19       | UI library                                         |
| TypeScript        | 6        | Type safety                                        |
| Vite              | 8        | Build tool & dev server                            |
| React Router      | 7        | Routing client-side                                |
| Redux Toolkit     | 2        | State management globale                           |
| styled-components | 6        | CSS-in-JS (usato in alcuni esempi)                 |
| CSS Modules       | —        | Stili locali per componente (approccio principale) |

---

## Note sullo stile del codice

- **Commenti enterprise a scopo didattico** — ogni file spiega il pattern implementato, il flusso dati, i vantaggi, gli svantaggi e le alternative. L'obiettivo è che il codice sia comprensibile anche rileggendolo dopo mesi.
- **CSS Modules** come approccio principale agli stili — garantisce scope locale per ogni componente ed elimina i conflitti di naming.
- **CSS Custom Properties** per il sistema di design — tutte le variabili (`--accent`, `--border`, `--bg` ecc.) sono definite in `index.css` e usate in tutti i moduli CSS, garantendo coerenza automatica e supporto al dark mode.
- **`useLifecycleLogger`** — hook custom che logga in console mount, update e unmount di ogni componente. Utile per visualizzare il lifecycle React mentre si studia.
