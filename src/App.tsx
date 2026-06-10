import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import About from './pages/about/About'
import FormDemo from './pages/controlled-vs-uncontrolled/FormDemo'
import Dashboard from './pages/hoc-vs-custom-hook/Dashboard'
import DashboardHOC from './pages/hoc-vs-custom-hook/DashboardHOC'
import Compound from './pages/compound-example/Compound'
import { lazy, Suspense } from 'react'
import { useTheme } from './hooks/useTheme'

const CryptoLive = lazy(() => import('./pages/crypto-live/CryptoLive'));

function App() {

	const { theme, toggleTheme } = useTheme()

	return (
		<div>

			{/* 🔥 TOGGLE THEME */}
			<button
				onClick={toggleTheme}
				style={{
					position: "fixed",
					top: 16,
					right: 16,
					zIndex: 10000,
					background: "var(--accent)",
					color: "white",
					border: "none",
					borderRadius: "8px",
					padding: "8px 12px",
					cursor: "pointer"
				}}
			>
				{theme === "dark" ? "☀️ Light" : "🌙 Dark"}
			</button>

			<h1>React Demo Didattica</h1>

			<nav>
				<Link to="/">Home</Link> |{" "}
				<Link to="/form-demo">Form Demo</Link> |{" "}
				<Link to="/compound">Compound</Link> |{" "}
				<Link to="/dashboard">Dashboard (Hook)</Link> |{" "}
				<Link to="/dashboard-hoc">Dashboard (HOC)</Link> |{" "}
				<Link to="/crypto">Crypto Live</Link> |{" "}
				<Link to="/about">About</Link>
			</nav>

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/form-demo' element={<FormDemo />} />
				<Route path='/about' element={<About />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/dashboard-hoc" element={<DashboardHOC />} />
				<Route path="/compound" element={<Compound />} />

				<Route
					path="/crypto"
					element={
						<Suspense fallback={<div>⏳ Caricamento Crypto...</div>}>
							<CryptoLive />
						</Suspense>
					}
				/>

			</Routes>
		</div>
	)
}

export default App
