import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">Forum Stages</h1>
        <nav className="nav">
          <Link to="/" className="nav-link active">Accueil</Link>
          <Link to="/login" className="nav-link" style={{ marginLeft: 'auto' }}>
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;