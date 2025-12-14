import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/public/HomePage.tsx";
import LoginPage from "./pages/auth/login/LoginPage.tsx";
import RegisterPage from "./pages/auth/register/RegisterPage.tsx";
import StudentRegisterPage from "./pages/auth/register/student/StudentRegisterPage.tsx";
import CompanyRegisterPage from "./pages/auth/register/company/CompanyRegisterPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";
import CompanyRoute from "./components/route/CompanyRoute.tsx";
import { VerifyPage } from "./pages/auth/verify/VerifyPage.tsx";
import CreateOfferPage from "./pages/company/offer/CreateOfferPage.tsx";
import OffersPage from "./pages/offers/OffersPage.tsx";
import PrivateRoute from "./components/route/PrivateRoute.tsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/offers" element={<OffersPage />} />
          </Route>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/company" element={<CompanyRegisterPage />} />
            <Route path="/register/verify" element={<VerifyPage />} />
          </Route>
          <Route element={<CompanyRoute />}>
            <Route path="/company/create-offer" element={<CreateOfferPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
