import { useAuth } from "../hooks/useAuth"

export function withAuth<T>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    const isLogged = useAuth()

    console.log("🔄 RENDER HOC Wrapper")

    if (!isLogged) {
      console.log("🚫 HOC BLOCK → NOT AUTH")
      return <p>Bloccato (HOC)...</p>
    }

    console.log("✅ HOC PASS → render child")

    return <Component {...props} />
  }
}