import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/public/HomePage.tsx";
import LoginPage from "./pages/auth/login/LoginPage.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
