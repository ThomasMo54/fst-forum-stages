import './RegisterPage.css';

function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Créer un compte</h1>
        <p>Veuillez choisir le type de compte que vous souhaitez créer :</p>
        <div className="register-options">
          <a href="/register/student" className="register-button student">
            🎓 Compte Étudiant
          </a>
          <a href="/register/company" className="register-button company">
            🏢 Compte Entreprise
          </a>
        </div>
        <p className="login-link">
          Vous avez déjà un compte ? <a href="/login">Connectez-vous</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
