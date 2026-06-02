import { Accordion } from "../components/accordion/Accordion"

export default function Compound() {
	return (
		<div style={{ padding: 20, fontFamily: "sans-serif" }}>
			<h1>Compound Components - Reusable Accordion</h1>

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