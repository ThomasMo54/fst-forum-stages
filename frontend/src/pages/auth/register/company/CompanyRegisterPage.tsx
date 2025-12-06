import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyRegisterPage.css';
import Header from '../../../../components/header/Header';
import Footer from '../../../../components/footer/Footer';
import Button from '../../../../components/button/Button';
import { countries } from '../../../../constants/countries';
import UserService, { type CreateCompanyDto } from '../../../../services/user.service';

const CompanyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateCompanyDto & { confirmPassword: string }>({
    name: '',
    email: '',
    contactEmail: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return false;
    }
    if (formData.name.length > 100) {
      setError("Le nom de l'entreprise ne doit pas dépasser 100 caractères.");
      return false;
    }

    if (!formData.email) {
      setError("L'email du compte est requis.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("L'email du compte n'est pas valide.");
      return false;
    }

    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      setError("L'email de contact n'est pas valide.");
      return false;
    }

    if (formData.streetAddress && formData.streetAddress.length > 200) {
      setError("L'adresse ne doit pas dépasser 200 caractères.");
      return false;
    }
    if (formData.city && formData.city.length > 100) {
      setError("La ville ne doit pas dépasser 100 caractères.");
      return false;
    }
    if (formData.postalCode && formData.postalCode.length > 20) {
      setError("Le code postal ne doit pas dépasser 20 caractères.");
      return false;
    }

    if (!formData.password) {
      setError("Le mot de passe est requis.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (formData.password.length > 200) {
        setError("Le mot de passe est trop long.");
        return false;
    }

    if (formData.password !== formData.confirmPassword) {
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
      const { confirmPassword, ...companyDto } = formData;
      await UserService.registerCompany(companyDto);
      navigate('/login'); 
    } catch (err: any) {
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
         setError("Erreur: L'inscription nécessite des droits administrateur (403 Forbidden). Le backend actuel ne permet pas l'inscription publique.");
      } else if (err.response && err.response.data) {
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
      <main className="company-register-container">
        <div className="company-register-box">
          <div className="company-register-header">
            <div className="company-register-logo">🏢</div>
            <h1>Créer un compte entreprise</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="company-register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom de l'entreprise</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Nom de l'entreprise" 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email du compte</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="Email de connexion" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Email de contact</label>
              <input 
                type="email" 
                id="contactEmail" 
                name="contactEmail" 
                required 
                placeholder="Email de contact public" 
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="streetAddress">Rue</label>
              <input 
                type="text" 
                id="streetAddress" 
                name="streetAddress" 
                required 
                placeholder="Adresse (Numéro et rue)" 
                value={formData.streetAddress}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="city">Ville</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  required 
                  placeholder="Ville" 
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="postalCode">Code Postal</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  name="postalCode" 
                  required 
                  placeholder="Code Postal" 
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="country">Pays</label>
              <select 
                id="country" 
                name="country" 
                required 
                value={formData.country}
                onChange={handleChange}
              >
                <option value="" disabled>Sélectionnez un pays</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Mot de passe" 
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                required 
                placeholder="Confirmer le mot de passe" 
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer le compte'}
            </Button>
          </form>

          <div className="company-register-footer-links">
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

export default CompanyRegisterPage;
