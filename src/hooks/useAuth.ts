import { useState, useEffect } from "react"

export function useAuth() {
	const [isLogged, setIsLogged] = useState(false)

	console.log("🔄 RENDER useAuth")

	useEffect(() => {
		console.log("✅ MOUNT useAuth")

		// simulazione async (tipo API o localStorage)
		const timeout = setTimeout(() => {
			console.log("🔐 Auth resolved → TRUE")
			setIsLogged(true)
		}, 1000)

		return () => {
			console.log("❌ UNMOUNT useAuth")
			clearTimeout(timeout)
		}
	}, [])

	return isLogged
}