import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentRegisterPage.css';
import Header from '../../../../components/header/Header';
import Footer from '../../../../components/footer/Footer';
import Button from '../../../../components/button/Button';
import UserService, { type CreateStudentDto } from '../../../../services/user.service';

const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateStudentDto & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentNumber: '000000',
    phone: '',
    educationLevel: '',
    fieldOfStudy: '',
    specialization: '',
    yearOfStudy: 0,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = (): boolean => {
    const { lastName, firstName, email, phone, password, confirmPassword, fieldOfStudy, educationLevel, yearOfStudy } = formData;
    if (!lastName.trim() || !firstName.trim()) {
      setError("Le nom et le prénom sont requis.");
      return false;
    }
    if (!email) {
      setError("L'email est requis.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'email n'est pas valide.");
      return false;
    }
    const phoneRegex = /^(\+33|0)[1-9] ?([0-9][0-9] ?){4}$/;
    if (!phoneRegex.test(phone)) {
      setError("Le numéro de téléphone n'est pas valide. (Format français attendu)");
      return false;
    }
    if (!fieldOfStudy || !educationLevel || !yearOfStudy) {
      setError("Le domaine, le niveau et l'année d'étude sont requis.");
      return false;
    }
    if (!password) {
      setError("Le mot de passe est requis.");
      return false;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...studentDto } = formData;
      await UserService.registerStudent(studentDto);
      navigate('/register/verify', { state: { email: formData.email } });
    } catch (err: any) {
      if (err.response && err.response.data) {
         const msg = err.response.data.message || (typeof err.response.data === 'string' ? err.response.data : "Une erreur est survenue.");
         setError(msg);
      } else {
         setError("Une erreur technique est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="student-register-container">
        <div className="student-register-box">
          <div className="student-register-header">
            <div className="student-register-logo">🎓</div>
            <h1>Créer un compte étudiant</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="student-register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input type="text" id="lastName" name="lastName" required placeholder="Nom" value={formData.lastName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input type="text" id="firstName" name="firstName" required placeholder="Prénom" value={formData.firstName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input type="email" id="email" name="email" required placeholder="Email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Numéro de téléphone</label>
              <input type="tel" id="phoneNumber" name="phone" placeholder="Numéro de téléphone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="fieldOfStudy">Type d'étude</label>
              <select id="fieldOfStudy" name="fieldOfStudy" required value={formData.fieldOfStudy} onChange={handleChange}>
                <option value="" disabled>Sélectionnez un type d'étude</option>
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
              <select id="levelOfStudy" name="educationLevel" required value={formData.educationLevel} onChange={handleChange}>
                <option value="" disabled>Sélectionnez un niveau d'étude</option>
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
              <select id="yearOfStudy" name="yearOfStudy" required value={formData.yearOfStudy} onChange={handleChange}>
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
              <input type="password" id="password" name="password" required placeholder="Mot de passe" autoComplete="new-password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirmer le mot de passe" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer le compte'}
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