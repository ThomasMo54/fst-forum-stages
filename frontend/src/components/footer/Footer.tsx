import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
            <p>&copy; 2026 Université de Lorraine - Gestion des Stages. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;