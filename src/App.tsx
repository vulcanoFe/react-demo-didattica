import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import FormDemo from './pages/FormDemo'
import Dashboard from './pages/Dashboard'
import DashboardHOC from './pages/DashboardHOC'
import Compound from './pages/Compound'
import { lazy, Suspense } from 'react'

const CryptoLive = lazy(() => import('./pages/CryptoLive'));

function App() {

	return (
		<div>
			<h1>React Demo Didattica</h1>

			<nav>
				<Link to="/">Home</Link> |{" "}
				<Link to="/form-demo">Form Demo</Link> |{" "}
				<Link to="/HOC">HOC</Link> |{" "}
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
