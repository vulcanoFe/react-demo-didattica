import { useRef } from "react"
import { useLifecycleLogger } from "../hooks/useLifecycleLogger"

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useLifecycleLogger("UncontrolledInput")

  console.log("🔄 RENDER UncontrolledInput")

  const handleChange = () => {
    console.log(
      "⌨️ USER INPUT Uncontrolled (DOM):",
      inputRef.current?.value
    )
  }

  const handleSubmit = () => {
    const value = inputRef.current?.value

    console.log("🚀 SUBMIT Uncontrolled:", value)
  }

  return (
    <div>
      <h3>Uncontrolled Input</h3>

      <input
        ref={inputRef}
        defaultValue=""
        onChange={handleChange}
        placeholder="Scrivi..."
      />

      <button onClick={handleSubmit}>Invia</button>
    </div>
  )
}

export default UncontrolledInput
