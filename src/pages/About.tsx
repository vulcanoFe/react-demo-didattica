import { useState } from "react";
import { useLifecycleLogger } from "../hooks/useLifecycleLogger";

function About() {

	const [text, setText] = useState<string>("")

	useLifecycleLogger("About", { text });

	return (
		<div>
			<h2>About</h2>

			<input
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Scrivi..."
			/>
		</div>
	)

}
export default About;