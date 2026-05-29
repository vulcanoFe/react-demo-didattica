import { useState, useEffect } from "react"
import { useLifecycleLogger } from "../hooks/useLifecycleLogger"

function ControlledInput() {
  const [value, setValue] = useState<string>("")

  useLifecycleLogger("ControlledInput", { value })

  console.log("🔄 RENDER ControlledInput")

  useEffect(() => {
    console.log("📦 EFFECT ControlledInput - valore aggiornato:", value)
  }, [value])

  const handleSubmit = () => {
    console.log("🚀 SUBMIT Controlled:", value)
  }

  return (
    <div>
      <h3>Controlled Input</h3>

      <input
        value={value}
        onChange={(e) => {
          console.log("⌨️ USER INPUT Controlled:", e.target.value)
          setValue(e.target.value)
        }}
        placeholder="Scrivi..."
      />

      <button onClick={handleSubmit}>Invia</button>

      <p>Valore React: {value}</p>
    </div>
  )
}

export default ControlledInput