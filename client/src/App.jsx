import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Landing from "./pages/Landing"
import Chat from "./pages/Chat"
import Booking from "./pages/Booking"
import KnowledgeBase from "./pages/KnowledgeBase"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
