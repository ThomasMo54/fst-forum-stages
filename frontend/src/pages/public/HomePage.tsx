import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import './HomePage.css';
import Button from '../../components/button/Button';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import OfferService, { type OfferDto } from '../../services/offer.service';
import { useAuth } from '../../context/AuthContext';
import roles from '../../constants/user_roles';

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
  const { isAuthenticated, user } = useAuth();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(false);
      try {
        const data = await OfferService.getAllOffers();
        setOffers(data);
      } catch (e) {
        setStatsError(true);
      } finally {
        setLoadingStats(false);
      }
    };

    void fetchStats();
  }, []);

  const stats = useMemo(() => {
    const offersCount = offers.length;
    const companyCount = new Set(offers.map((o) => o.companyId)).size;
    const remoteCount = offers.filter((o) => !!o.remoteWorkPolicy).length;
    return { offersCount, companyCount, remoteCount };
  }, [offers]);

  const displayValue = (value: number) => {
    if (loadingStats) return '...';
    if (statsError) return 'N/A';
    return value.toString();
  };

  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        <div className="container">

          {/* ===== Welcome ===== */}
          <section className="welcome-section">
            <h2>Bienvenue sur le portail des stages</h2>
            <p className="subtitle">
              Universite de Lorraine : Connectez talents et opportunites
            </p>

            <div
              style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <Button to="/offers" variant="primary">
                Consulter les offres de stage
              </Button>

              <Button href="#portals" variant="secondary">
                Voir les espaces
              </Button>
            </div>
          </section>

          {/* ===== Portals ===== */}
          <section id="portals" className="page-header">
            <h2>Choisissez votre espace</h2>
            <p>Accedez aux services dedies selon votre profil</p>
          </section>

          <section className="dashboard-grid">
            {/* Affichage des cartes selon l'état d'authentification */}
            {isAuthenticated ? (
              // Utilisateur connecté : affiche seulement sa carte
              <>
                {user?.roles.includes(roles.STUDENT) && (
                  <DashboardCard
                    icon="🎓"
                    title="Espace Etudiants"
                    description="Consultez les offres de stage, gérez vos candidatures et validez votre convention."
                    buttonText="Accéder à mon espace"
                    linkTo="/offers"
                    iconColorVar="--secondary-color"
                  />
                )}

                {user?.roles.includes(roles.COMPANY) && (
                  <DashboardCard
                    icon="🏢"
                    title="Espace Entreprises"
                    description="Déposez vos offres, recherchez des profils et gérez les processus de recrutement."
                    buttonText="Publier une offre"
                    linkTo="/company/create-offer"
                    iconColorVar="--success-color"
                  />
                )}

                {user?.roles.includes(roles.ADMIN) && (
                  <DashboardCard
                    icon="🛡️"
                    title="Administration"
                    description="Espace réservé au personnel de l'université pour la gestion de la plateforme."
                    buttonText="Panel d'administration"
                    linkTo="/auth/login?role=admin"
                    iconColorVar="--danger-color"
                  />
                )}
              </>
            ) : (
              // Visiteur non connecté : affiche toutes les cartes
              <>
                <DashboardCard
                  icon="🎓"
                  title="Espace Étudiants"
                  description="Consultez les offres de stage, gérez vos candidatures et validez votre convention."
                  buttonText="Voir les offres"
                  linkTo="/offers"
                  iconColorVar="--secondary-color"
                />

                <DashboardCard
                  icon="🏢"
                  title="Espace Entreprises"
                  description="Déposez vos offres, recherchez des profils et gérez les processus de recrutement."
                  buttonText="S'inscrire"
                  linkTo="/register"
                  iconColorVar="--success-color"
                />

              </>
            )}
          </section>


          {/* ===== Stats ===== */}
          <section id="stats" className="quick-stats">
            <h3>La plateforme en chiffres</h3>
            <div className="stats-grid">
              <StatItem number={displayValue(stats.offersCount)} label="Offres disponibles" />
              <StatItem number={displayValue(stats.companyCount)} label="Entreprises partenaires" />
              <StatItem number={displayValue(stats.remoteCount)} label="Offres avec teletravail" />
            </div>
          </section>

          {/* ===== Info ===== */}
          <section className="info-section" style={{ marginTop: '3rem' }}>
            <h3>Pourquoi utiliser cette plateforme ?</h3>
            <ul className="info-list">
              <li>Centralisation de toutes les offres de stage de l'universite</li>
              <li>Validation stricte des entreprises par l'administration</li>
            </ul>

            <div style={{ marginTop: '1.5rem' }}>
              <Button to="/offers" variant="secondary">
                Acceder aux offres disponibles
              </Button>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
