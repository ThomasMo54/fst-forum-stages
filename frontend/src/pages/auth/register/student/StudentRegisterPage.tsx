import React from 'react';
import './StudentRegisterPage.css';
import Header from '../../../../components/header/Header';
import Footer from '../../../../components/footer/Footer';
import Button from '../../../../components/button/Button';

const StudentRegisterPage: React.FC = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="student-register-container">
        <div className="student-register-box">
          <div className="student-register-header">
            <div className="student-register-logo">🎓</div>
            <h1>Créer un compte étudiant</h1>
          </div>

          <form className="student-register-form">
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input type="text" id="lastName" name="lastName" required placeholder="Nom" />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input type="text" id="firstName" name="firstName" required placeholder="Prénom" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input type="email" id="email" name="email" required placeholder="Email" />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Numéro de téléphone</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="Numéro de téléphone" />
            </div>

            <div className="form-group">
              <label htmlFor="fieldOfStudy">Type d'étude</label>
              <select id="fieldOfStudy" name="fieldOfStudy" required>
                <option value="">Sélectionnez un type d'étude</option>
                <option value="math">Mathématiques</option>
                <option value="cs">Informatique</option>
                <option value="physics">Physique</option>
                <option value="chemistry">Chimie</option>
                <option value="biology">Biologie</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="levelOfStudy">Niveau d'étude</label>
              <select id="levelOfStudy" name="levelOfStudy" required>
                <option value="">Sélectionnez un niveau d'étude</option>
                <option value="but">BUT</option>
                <option value="licence">Licence</option>
                <option value="master">Master</option>
                <option value="engineering">Cycle ingénieur</option>
                <option value="doctorate">Doctorat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="yearOfStudy">Année d'étude</label>
              <select id="yearOfStudy" name="yearOfStudy" required>
                <option value="">Sélectionnez une année</option>
                <option value="1">1ère année</option>
                <option value="2">2ème année</option>
                <option value="3">3ème année</option>
                <option value="4">4ème année</option>
                <option value="5">5ème année et plus</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input type="password" id="password" name="password" required placeholder="Mot de passe" autoComplete="new-password" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirmer le mot de passe" autoComplete="new-password" />
            </div>

            <Button type="submit" variant="primary">
              Créer le compte
            </Button>
          </form>

          <div className="student-register-footer-links">
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
};

export default StudentRegisterPage;
