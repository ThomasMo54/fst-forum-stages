import React from 'react';
import '../../styles/global.css';
import './HomePage.css';
import Button from '../../components/button/Button';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  linkTo: string;
  iconColorVar: string;
}

interface StatItemProps {
  number: string;
  label: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
 icon,
 title,
 description,
 buttonText,
 linkTo,
 iconColorVar
}) => {
  return (
    <div className="dashboard-card">
      <div
        className="card-icon"
        style={{ color: `var(${iconColorVar})` }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>

      <Button
        to={linkTo}
        variant="primary"
        className="card-button-override"
      >
        {buttonText}
      </Button>
    </div>
  );
};

const StatItem: React.FC<StatItemProps> = ({ number, label }) => {
  return (
    <div className="stat-item">
      <span className="stat-number">{number}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        <div className="container">

          <section className="welcome-section">
            <h2>Bienvenue sur le portail des stages</h2>
            <p className="subtitle">Université de Lorraine : Connectez talents et opportunités</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button href="#portals" variant="primary">
                Voir les espaces
              </Button>
              <Button href="#stats" variant="secondary">
                Chiffres clés
              </Button>
            </div>
          </section>

          <section id="portals" className="page-header">
            <h2>Choisissez votre espace</h2>
            <p>Accédez aux services dédiés selon votre profil</p>
          </section>

          <section className="dashboard-grid">
            <DashboardCard
              icon="🎓"
              title="Espace Étudiants"
              description="Consultez les offres de stage, gérez vos candidatures et validez votre convention."
              buttonText="Je suis étudiant"
              linkTo="/auth/login?role=student"
              iconColorVar="--secondary-color"
            />

            <DashboardCard
              icon="🏢"
              title="Espace Entreprises"
              description="Déposez vos offres, recherchez des profils et gérez les processus de recrutement."
              buttonText="Je suis une entreprise"
              linkTo="/auth/login?role=company"
              iconColorVar="--success-color"
            />

            <DashboardCard
              icon="⚙️"
              title="Administration"
              description="Espace réservé au personnel de l'université pour la gestion de la plateforme."
              buttonText="Accès Admin"
              linkTo="/auth/login?role=admin"
              iconColorVar="--danger-color"
            />
          </section>

          <section id="stats" className="quick-stats">
            <h3>La plateforme en chiffres</h3>
            <div className="stats-grid">
              <StatItem number="500+" label="Offres disponibles" />
              <StatItem number="120" label="Entreprises" />
              <StatItem number="100%" label="Sécurisé & Validé" />
            </div>
          </section>

          <section className="info-section" style={{ marginTop: '3rem' }}>
            <h3>Pourquoi utiliser cette plateforme ?</h3>
            <ul className="info-list">
              <li>Centralisation de toutes les offres de stage de l'université</li>
              <li>Validation stricte des entreprises par l'administration</li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;