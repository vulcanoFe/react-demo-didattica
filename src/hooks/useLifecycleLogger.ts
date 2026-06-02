import { useEffect } from "react"

export function useLifecycleLogger(
	name: string,
	deps?: Record<string, unknown>
) {

	console.log(`🔄 RENDER ${name}`)

	// MOUNT + UNMOUNT
	useEffect(() => {
		console.log(`✅ MOUNT ${name}`)

		return () => {
			console.log(`❌ UNMOUNT ${name}`)
		}
	}, [name])

	// UPDATE
	useEffect(() => {
		if (!deps) return

		console.log(`🔁 UPDATE ${name}`)

		Object.entries(deps).forEach(([key, value]) => {
			console.log(`   ${key}:`, value)
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps ? Object.values(deps) : [])

}