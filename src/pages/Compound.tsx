import { Accordion } from "../components/accordion/Accordion"
import schema from "../assets/compound_components_accordion_schema.svg"

export default function Compound() {
	return (
		<div>
			<h1>Compound Components</h1>
			<h2>Schema</h2>
			{/* Schema riepilogativo del pattern — file statico da public/ */}
			<img
				style={{ 'width': 600 }}
				src={schema}
				alt="Schema del pattern Compound Components applicato all'Accordion"
			/>

			<h2>Esempio</h2>
			<Accordion>
				<Accordion.Item>
					<Accordion.Header id="compound">
						Cos'è Compound Components?
					</Accordion.Header>
					<Accordion.Panel id="compound">
						Pattern in cui lo stato viene gestito dal parent e condiviso via context
						senza prop drilling, permettendo una API dichiarativa e componibile.
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item>
					<Accordion.Header id="benefits">
						Vantaggi
					</Accordion.Header>
					<Accordion.Panel id="benefits">
						<ul>
							<li>Riutilizzabile</li>
							<li>API pulita</li>
							<li>Zero prop drilling</li>
							<li>Perfetto per design system</li>
						</ul>
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item>
					<Accordion.Header id="drawbacks">
						Svantaggi
					</Accordion.Header>
					<Accordion.Panel id="drawbacks">
						<ul>
							<li>Debug meno immediato</li>
							<li>State nascosto nel context</li>
							<li>Possibili rerender multipli</li>
						</ul>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	)
}