import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';
import user_roles from "../../constants/user_roles.ts";

const Header: React.FC = () => {
  const {isAuthenticated, user, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">Forum des Stages</h1>
        <nav className="nav">
          <Link to="/" className="nav-link active">Accueil</Link>
          {isAuthenticated && user?.roles.includes(user_roles.COMPANY) && (
            <>
              <Link to="/company/my-offers" className="nav-link">Vos Offres</Link>
            </>
          )}
          <div className="auth-section">
            {isAuthenticated && user ? (
              <div className="user-menu">
                <span className="user-email">
                  {user.sub}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Déconnexion
                </button>
                <Link to={user.roles.includes(user_roles.COMPANY) ? "/company/modify-infos" : "/student/modify-infos"} className="nav-link active">Modifier vos informations</Link>
              </div>
            ) : (
              <Link to="/login" className="nav-link btn-login">
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;