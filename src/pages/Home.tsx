import { useState } from "react";
import { useLifecycleLogger } from "../hooks/useLifecycleLogger";
import Bottone from "../components/Bottone";

function Home() {

	const [count, setCount] = useState<number>(0);
	const [primario, setPrimario] = useState<boolean>(true)

	useLifecycleLogger("Home", { count, primario });

	return (
		<div>
			<h2>Home</h2>

			<hr />

			<h3>Contatore</h3>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>
				Incrementa
			</button>

			<hr />

			<h3>Styled Components + Re-Render Demo</h3>
			<p>Primario: {String(primario)}</p>
			<button onClick={() => setPrimario(!primario)}>
				Toggle stile
			</button>
			<p>Bottone con bg calocalto tramite JS</p>
			<Bottone $primario={primario} />

		</div>

	);

}
export default Home;