import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import '../../../styles/global.css';
import './LoginPage.css';

import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Button from '../../../components/button/Button';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await login(email, password);
      navigate('/')
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        navigate("/register/verify", { state: { email } });
        return;
      }
      setError('Échec de la connexion. Vérifiez vos identifiants et réessayez.');
    }
  };

  useEffect(() => {
    if(error) setError('');
  }, [email, password]);

  return (
    <div className="page-wrapper">
      <Header />

      <main className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">🔐</div>
            <h1>Connexion</h1>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group password-toggle">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Mot de passe"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="remember-forgot">
              <Button
                variant="link"
                to="/auth/forgot-password"
                className="forgot-password-link"
              >
                Mot de passe oublié ?
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
            >
              Se connecter
            </Button>
          </form>

          <div className="login-footer-links">
            <p>Vous n'avez pas de compte ?</p>
            <Button
              variant="link"
              to="/register"
            >
              Créer un compte
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;