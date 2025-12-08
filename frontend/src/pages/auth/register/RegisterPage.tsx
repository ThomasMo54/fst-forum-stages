import './RegisterPage.css';
import Button from '../../../components/button/Button';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';

function RegisterPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="register-container">
        <div className="register-box">
          <div className="register-header">
            <div className="register-logo">👤</div>
            <h1>Créer un compte</h1>
          </div>
          
          <p className="register-instruction">Veuillez choisir le type de compte que vous souhaitez créer :</p>
          
          <div className="register-options">
            <Button to="/register/student" variant="primary" className="full-width">
              🎓 Compte Étudiant
            </Button>
            <Button to="/register/company" variant="primary" className="full-width">
              🏢 Compte Entreprise
            </Button>
          </div>

          <div className="register-footer-links">
            <p>Vous avez déjà un compte ?</p>
            <Button
              variant="link"
              to="/login"
            >
              Connectez-vous
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RegisterPage;
