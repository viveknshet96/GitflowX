import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Result from "./pages/Result.jsx";
import History from "./pages/History.jsx";

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e6edf3' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result/:owner/:repo" element={<Result />} />
        <Route path="/history" element={<History />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111318',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6edf3',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          },
        }}
      />
    </div>
  );
}
