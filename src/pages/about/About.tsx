/**
 * @file About.tsx
 * @description Pagina di presentazione del progetto react-demo-didattica.
 *
 * Questa pagina non contiene logica React avanzata: il suo scopo è puramente
 * documentale. È il punto di partenza per chiunque apra l'app per la prima volta
 * e voglia capire cosa sta guardando e come orientarsi nel codice.
 */

import styles from "./About.module.css"

// ─────────────────────────────────────────────────────────────────────────────
// DATI — Sezioni della pagina
// Definiti fuori dal componente perché sono costanti: non cambiano mai,
// quindi non appartengono allo state né causano re-render.
// ─────────────────────────────────────────────────────────────────────────────

/** Concetti React esplorati nel progetto, con la route corrispondente */
const CONCETTI = [
	{
		emoji: "🔄",
		titolo: "Lifecycle & Hooks",
		descrizione:
			"useState, useEffect, useRef, useCallback. Come React monta, aggiorna e smonta i componenti.",
		route: "/",
	},
	{
		emoji: "📋",
		titolo: "Controlled vs Uncontrolled",
		descrizione:
			"Due approcci per gestire i form: React come fonte di verità vs DOM come fonte di verità.",
		route: "/form",
	},
	{
		emoji: "🧩",
		titolo: "Compound Components",
		descrizione:
			"Pattern avanzato: componenti che condividono stato implicito via Context (es. Accordion).",
		route: "/accordion",
	},
] as const

/** Stack tecnologico del progetto */
const STACK = [
	{ nome: "React 19", ruolo: "UI library", colore: "accent" },
	{ nome: "TypeScript", ruolo: "Type safety", colore: "neutral" },
	{ nome: "Vite 8", ruolo: "Build tool & dev server", colore: "accent" },
	{ nome: "React Router 7", ruolo: "Routing client-side", colore: "neutral" },
	{ nome: "Redux Toolkit", ruolo: "State management globale", colore: "neutral" },
	{ nome: "CSS Modules", ruolo: "Stili locali per componente", colore: "neutral" },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTI HELPER
// Piccoli componenti estratti per mantenere il JSX principale leggibile.
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h3 className={styles.sectionTitle}>{children}</h3>
}

function Callout({ children }: { children: React.ReactNode }) {
	return <div className={styles.callout}>{children}</div>
}

function CodeTag({ children }: { children: React.ReactNode }) {
	return <code className={styles.inlineCode}>{children}</code>
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

function About() {
	return (
		<div className={styles.page}>

			{/* ── HERO ────────────────────────────────────────────────────────── */}
			<header className={styles.hero}>
				<div className={styles.heroBadge}>📖 Progetto didattico</div>
				<h2 className={styles.heroTitle}>react-demo-didattica</h2>
				<p className={styles.heroSubtitle}>
					Un laboratorio interattivo per imparare React esplorando i pattern
					fondamentali del framework con esempi reali, commentati in profondità.
				</p>
			</header>

			{/* ── COME USARE ──────────────────────────────────────────────────── */}
			<section className={styles.section}>
				<SectionTitle>🗺️ Come usare questo progetto</SectionTitle>
				<p className={styles.prose}>
					Ogni pagina dell'app è un <strong>esempio interattivo</strong> di un
					concetto React. Il vero apprendimento avviene nel codice sorgente:
					ogni file è scritto come se fosse una lezione, con commenti che
					spiegano il <em>perché</em> di ogni scelta, non solo il{" "}
					<em>cosa</em>.
				</p>
				<Callout>
					💡 <strong>Il suggerimento più importante:</strong> apri i file
					sorgente mentre navighi l'app. Usa la console del browser (F12) per
					osservare i log di lifecycle, render e state change in tempo reale.
				</Callout>

				<div className={styles.stepList}>
					<div className={styles.step}>
						<span className={styles.stepNumber}>1</span>
						<div>
							<strong>Naviga una pagina</strong> — osserva il comportamento
							nell'interfaccia.
						</div>
					</div>
					<div className={styles.step}>
						<span className={styles.stepNumber}>2</span>
						<div>
							<strong>Apri il file sorgente</strong> corrispondente in
							<CodeTag>src/pages/</CodeTag> o{" "}
							<CodeTag>src/components/</CodeTag>.
						</div>
					</div>
					<div className={styles.step}>
						<span className={styles.stepNumber}>3</span>
						<div>
							<strong>Leggi i commenti</strong> — ogni sezione spiega il
							concetto, i vantaggi, gli svantaggi e le alternative.
						</div>
					</div>
					<div className={styles.step}>
						<span className={styles.stepNumber}>4</span>
						<div>
							<strong>Modifica il codice</strong> e osserva cosa cambia.
							Vite ricarica istantaneamente grazie all'HMR.
						</div>
					</div>
				</div>
			</section>

			{/* ── CONCETTI ESPLORATI ──────────────────────────────────────────── */}
			<section className={styles.section}>
				<SectionTitle>🧠 Concetti esplorati</SectionTitle>
				<div className={styles.conceptGrid}>
					{CONCETTI.map((c) => (
						<div key={c.titolo} className={styles.conceptCard}>
							<span className={styles.conceptEmoji}>{c.emoji}</span>
							<strong className={styles.conceptTitle}>{c.titolo}</strong>
							<p className={styles.conceptDesc}>{c.descrizione}</p>
							<code className={styles.conceptRoute}>{c.route}</code>
						</div>
					))}
				</div>
			</section>

			{/* ── VITE ────────────────────────────────────────────────────────── */}
			<section className={styles.section}>
				<SectionTitle>⚡ Come funziona Vite</SectionTitle>
				<p className={styles.prose}>
					Vite è il <strong>build tool</strong> che trasforma il tuo codice
					TypeScript/JSX in JavaScript che il browser capisce. È radicalmente
					più veloce dei tool precedenti (Webpack, CRA) per un motivo
					architetturale preciso.
				</p>

				<div className={styles.compareGrid}>
					<div className={`${styles.compareCard} ${styles.compareCardDev}`}>
						<div className={styles.compareHeader}>
							<span>🛠️</span>
							<span className={styles.compareTitle}>Modalità Dev</span>
							<CodeTag>npm run dev</CodeTag>
						</div>
						<p className={styles.compareDesc}>
							Vite <strong>non fa il bundle</strong> in sviluppo. Sfrutta i
							moduli ES nativi del browser (<CodeTag>type="module"</CodeTag>):
							ogni file viene servito direttamente dal server di sviluppo,
							trasformato solo quando il browser lo richiede.
						</p>
						<ul className={styles.compareList}>
							<li>
								<strong>Avvio istantaneo</strong> — non deve raggruppare tutti
								i file prima di partire. Il server è pronto in &lt; 1 secondo
								anche su progetti grandi.
							</li>
							<li>
								<strong>HMR ultrarapido</strong> (Hot Module Replacement) —
								quando modifichi un file, Vite aggiorna <em>solo quel modulo</em>{" "}
								nel browser senza ricaricare la pagina. Lo state React viene
								preservato.
							</li>
							<li>
								<strong>Nessun bundling</strong> — il browser risolve le
								importazioni modulo per modulo, on demand.
							</li>
						</ul>
					</div>

					<div className={`${styles.compareCard} ${styles.compareCardProd}`}>
						<div className={styles.compareHeader}>
							<span>🚀</span>
							<span className={styles.compareTitle}>Build per Produzione</span>
							<CodeTag>npm run build</CodeTag>
						</div>
						<p className={styles.compareDesc}>
							In produzione Vite usa <strong>Rollup</strong> per creare un
							bundle ottimizzato. Qui il bundling è necessario: il browser
							dovrebbe fare centinaia di richieste HTTP per ogni modulo,
							il che è lento in rete reale.
						</p>
						<ul className={styles.compareList}>
							<li>
								<strong>Tree-shaking</strong> — il codice non usato viene
								eliminato. Se importi solo <CodeTag>useState</CodeTag> da React,
								il resto della libreria non finisce nel bundle.
							</li>
							<li>
								<strong>Code splitting</strong> — il bundle viene diviso in
								chunk. Le pagine vengono caricate solo quando l'utente le visita
								(lazy loading automatico con React Router).
							</li>
							<li>
								<strong>Minificazione</strong> — variabili rinominate, spazi
								rimossi, output compresso. Il bundle finale è una frazione del
								codice sorgente.
							</li>
							<li>
								<strong>TypeScript compilato</strong> — TS viene prima
								controllato da <CodeTag>tsc -b</CodeTag>, poi trasformato in
								JS da Vite (usa Oxc, il compilatore in Rust).
							</li>
						</ul>
					</div>
				</div>

				<Callout>
					🔍 <strong>Perché Vite è così veloce in dev?</strong> I tool
					precedenti come Webpack dovevano costruire l'intero grafo delle
					dipendenze e creare un bundle <em>prima</em> di poter avviare il
					server. Con 1000 moduli, questo significava attendere decine di
					secondi. Vite inverte la logica: parte subito e trasforma i file{" "}
					<em>on demand</em>, solo quando richiesti.
				</Callout>
			</section>

			{/* ── STACK ───────────────────────────────────────────────────────── */}
			<section className={styles.section}>
				<SectionTitle>📦 Stack tecnologico</SectionTitle>
				<div className={styles.stackGrid}>
					{STACK.map((s) => (
						<div
							key={s.nome}
							className={`${styles.stackItem} ${s.colore === "accent" ? styles.stackItemAccent : ""}`}
						>
							<span className={styles.stackNome}>{s.nome}</span>
							<span className={styles.stackRuolo}>{s.ruolo}</span>
						</div>
					))}
				</div>
			</section>

			{/* ── STRUTTURA FILE ──────────────────────────────────────────────── */}
			<section className={styles.section}>
				<SectionTitle>🗂️ Struttura del progetto</SectionTitle>
				<pre className={styles.fileTree}>{`src/
├── components/          # Componenti riutilizzabili
│   ├── Accordion/       # Pattern Compound Components
│   │   ├── Accordion.tsx
│   │   ├── Accordion.module.css
│   │   ├── AccordionContext.ts
│   │   └── useAccordion.ts
│   ├── ControlledForm.tsx
│   └── UncontrolledForm.tsx
├── hooks/               # Custom hooks
│   ├── useForm.ts       # Gestione form controlled
│   └── useLifecycleLogger.ts
├── pages/               # Una pagina = un concetto
│   ├── About.tsx        # ← sei qui
│   ├── FormDemo.tsx     # Controlled vs Uncontrolled
│   └── FormDemo.module.css
└── main.tsx             # Entry point, router`}</pre>
			</section>

		</div>
	)
}

export default About