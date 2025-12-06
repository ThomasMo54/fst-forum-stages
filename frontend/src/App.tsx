import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/public/HomePage.tsx";
import LoginPage from "./pages/auth/login/LoginPage.tsx";
import RegisterPage from "./pages/auth/register/RegisterPage.tsx";
import StudentRegisterPage from "./pages/auth/register/student/StudentRegisterPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
