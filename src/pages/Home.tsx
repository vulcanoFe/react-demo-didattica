import { useState } from "react";
import { useLifecycleLogger } from "../hooks/useLifecycleLogger";
import Bottone from "../components/Bottone";
import Modal from "../components/Modal";

function Home() {

	const [count, setCount] = useState<number>(0);
	const [primario, setPrimario] = useState<boolean>(true)
	const [open, setOpen] = useState(false);

	const openModal = () => {
		console.log("[App] Apro modal");
		setOpen(true);
	};

	const closeModal = () => {
		console.log("[App] Chiudo modal");
		setOpen(false);
	};

	useLifecycleLogger("Home", { count, primario });

	return (
		<div>
			<h1>Home</h1>

			<hr />

			<h2>Contatore</h2>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>
				Incrementa
			</button>

			<hr />

			<h2>Styled Components + Re-Render Demo</h2>
			<p>Primario: {String(primario)}</p>
			<button onClick={() => setPrimario(!primario)}>
				Toggle stile
			</button>
			<p>Bottone con bg calocalto tramite JS</p>
			<Bottone $primario={primario} />

			<hr />

			<h2>React Portal Demo</h2>

			<button onClick={openModal}>Apri Modal</button>

			{/* Anche se qui sembra figlio... */}
			<Modal isOpen={open} onClose={closeModal}>
				<p>Contenuto passato come children</p>
			</Modal>

		</div>

	);

}
export default Home;