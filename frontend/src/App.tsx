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
import MyOffersPage from "./pages/company/offer/MyOffersPage.tsx";
import OffersPage from "./pages/offers/OffersPage.tsx";
import ApplyOfferPage from "./pages/offers/ApplyOfferPage.tsx";
import PrivateRoute from "./components/route/PrivateRoute.tsx";
import ModifyStudentInfosPage from "./pages/student/ModifyStudentInfos.tsx";
import StudentRoute from "./components/route/StudentRoute.tsx";
import ModifyCompanyInfosPage from "./pages/company/ModifyCompanyInfos.tsx";
import OfferFormPage from "./pages/company/offer/OfferFormPage.tsx";
import ApplicationPage from "./pages/offers/ApplicationPage.tsx";
import StudentMyApplicationsPage from "./pages/student/applications/MyApplicationsPage.tsx";
import AdminRoute from "./components/route/AdminRoute.tsx";
import StatsPage from "./pages/admin/stats/StatsPage.tsx";
import StudentManagementPage from "./pages/admin/students/StudentManagementPage.tsx";
import CompanyManagementPage from "./pages/admin/companies/CompanyManagementPage.tsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/:offerId/apply" element={<ApplyOfferPage />} />
            <Route path="/offers/:offerId/apply/:applicationId" element={<ApplyOfferPage />} />
          </Route>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/company" element={<CompanyRegisterPage />} />
            <Route path="/register/verify" element={<VerifyPage />} />
          </Route>
          <Route element={<CompanyRoute />}>
            <Route path="/company/create-offer" element={<OfferFormPage mode="create" />} />
            <Route path="/company/edit-offer/:offerId" element={<OfferFormPage mode="edit" />}/>
            <Route path="/company/my-offers" element={<MyOffersPage />} />
            <Route path="/company/modify-infos" element={<ModifyCompanyInfosPage />} />
            <Route path="/offers/:offerId/applications" element={<ApplicationPage />} />
          </Route>
          <Route element={<StudentRoute />}>
            <Route path="/student/modify-infos" element={<ModifyStudentInfosPage />} />
            <Route path="/student/my-applications" element={<StudentMyApplicationsPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/stats" element={<StatsPage />} />
            <Route path="/admin/students" element={<StudentManagementPage />} />
            <Route path="/admin/companies" element={<CompanyManagementPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;