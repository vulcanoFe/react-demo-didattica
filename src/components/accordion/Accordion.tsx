
import { useState } from "react"
import { useLifecycleLogger } from "../../hooks/useLifecycleLogger"
import { AccordionContext } from "./AccordionContext"
import { useAccordion } from "./useAccordion"

type AccordionProps = {
	children: React.ReactNode
}

type ItemProps = {
	children: React.ReactNode
}

type HeaderProps = {
	id: string
	children: React.ReactNode
}

type PanelProps = {
	id: string
	children: React.ReactNode
}

// =========================
// ROOT COMPONENT
// =========================

export function Accordion({ children }: AccordionProps) {
	const [openId, setOpenId] = useState<string | null>(null)

	useLifecycleLogger("Accordion", { openId })

	console.log("📦 Accordion STATE:", openId)

	return (
		<AccordionContext.Provider value={{ openId, setOpenId }}>
			<div
				style={{
					border: "1px solid #333",
					borderRadius: 8,
					padding: 10,
				}}
			>
				{children}
			</div>
		</AccordionContext.Provider>
	)
}

// =========================
// ITEM
// =========================

function Item({ children }: ItemProps) {
	useLifecycleLogger("Accordion.Item")

	return <div style={{ marginBottom: 10 }}>{children}</div>
}

// =========================
// HEADER
// =========================

function Header({
	id,
	children,
}: HeaderProps) {
	const { openId, setOpenId } = useAccordion()

	useLifecycleLogger(`Header ${id}`, { openId })

	const isOpen = openId === id

	return (
		<div
			onClick={() => {
				console.log(`👉 CLICK Header ${id}`)

				setOpenId(prev => (prev === id ? null : id))
			}}
			style={{
				cursor: "pointer",
				padding: 10,
				background: "#f0f0f0",
				fontWeight: isOpen ? "bold" : "normal",
				borderRadius: 6,
			}}
		>
			{children}
		</div>
	)
}

// =========================
// PANEL
// =========================

function Panel({
	id,
	children,
}: PanelProps) {
	const { openId } = useAccordion()

	useLifecycleLogger(`Panel ${id}`, { openId })

	const isOpen = openId === id

	console.log(`👀 Panel ${id} render -> isOpen:`, isOpen)

	if (!isOpen) return null

	return (
		<div
			style={{
				padding: 10,
				border: "1px solid #ddd",
				borderTop: "none",
				borderRadius: "0 0 6px 6px",
			}}
		>
			{children}
		</div>
	)
}

// =========================
// COMPOUND EXPORT (IMPORTANTISSIMO)
// =========================

Accordion.Item = Item
Accordion.Header = Header
Accordion.Panel = Panel