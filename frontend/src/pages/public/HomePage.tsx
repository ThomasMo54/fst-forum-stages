import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import './HomePage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom';
import Button from '../../components/button/Button';
import OfferService, { type PaginatedOffers } from '../../services/offer.service';
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

const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <div className="stat-item">
    <span className="stat-number">{number}</span>
    <span className="stat-label">{label}</span>
  </div>
);


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




const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [offers, setOffers] = useState<PaginatedOffers>({
    content: [],
    page: { size: 0, number: 0, totalElements: 0, totalPages: 0 }
  });
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
    const offersCount = offers.page.totalElements;
    const companyCount = new Set(offers.content.map((o) => o.companyId)).size;
    const remoteCount = offers.content.filter((o) => !!o.remoteWorkPolicy).length;
    return { offersCount, companyCount, remoteCount };
  }, [offers]);

  const displayValue = (value: number) => {
    if (loadingStats) return '...';
    if (statsError) return 'N/A';
    return value.toString();
  };

  const displayValuePlus = (value: number) => {
      if (loadingStats) return '...';
      if (statsError) return 'N/A';
      return `${value}+`;
  };

  const isStudent = isAuthenticated && user?.roles.includes(roles.STUDENT);
  const isCompany = isAuthenticated && user?.roles.includes(roles.COMPANY);

  return (
    <div className="home-page">
      <Header />

      <main>
        {/* Hero Section ... */}
        <section className="hero">
            <div className="hero-content">
                <h4>Bienvenue sur le portail des stages</h4>
                <h1>Université de Lorraine :<br/>Connectez talents et opportunités</h1>
                <p>La plateforme officielle pour trouver et proposer des stages. Connectez-vous pour découvrir les offres disponibles ou déposer votre annonce.</p>
                <div className="button-group">
                    <Link to="/offers" className="btn btn-primary">Consulter les offres de stage</Link>
                    <a href="#portals" className="btn btn-secondary">Voir les espaces</a>
                </div>
            </div>
        </section>

        {/* Services Section - Espaces */}
        <section id="portals" className="services-section">
            <div className="container">
                <div className="section-header">
                    <h2>Choisissez votre espace</h2>
                    <p>Accédez aux services dédiés selon votre profil</p>
                </div>
                <div className="services-grid">
                    {/* Espace Étudiants */}
                    <div className="service-card">
                        <div className="icon-wrapper">
                            <div className="service-icon">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="45" r="18" fill="#ffffff"/>
                                    <rect x="35" y="32" width="30" height="8" rx="2" fill="#ffffff" opacity="0.9"/>
                                    <rect x="35" y="40" width="30" height="3" rx="1.5" fill="#ffffff" opacity="0.9"/>
                                    <path d="M62 32 L65 32 L64 38 L62 40 Z" fill="#ffffff" opacity="0.9"/>
                                    <circle cx="64" cy="40" r="2" fill="#ffffff" opacity="0.9"/>
                                    <path d="M35 50 Q35 55 40 60 L45 65 L55 65 L60 60 Q65 55 65 50 Z" fill="#ffffff" opacity="0.9"/>
                                </svg>
                            </div>
                        </div>
                        <h3>Espace Étudiants</h3>
                        <p>Consultez les offres de stage, gérez vos candidatures et validez votre convention.</p>
                        {isStudent ? (
                            <div className="card-button-group">
                                <Link to="/offers" className="service-link">Offres</Link>
                                <Link to="/student/my-offers" className="service-link">Mes postulations</Link>
                            </div>
                        ) : (
                            <Link to="/offers" className="service-link">Voir les offres de stage</Link>
                        )}
                    </div>

                    {/* Espace Entreprises */}
                    <div className="service-card">
                        <div className="icon-wrapper">
                            <div className="service-icon">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.2)" stroke="#ffffff" strokeWidth="3"/>
                                    <rect x="25" y="30" width="28" height="35" fill="#ffffff" opacity="0.95"/>
                                    <rect x="28" y="35" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="35" y="35" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="42" y="35" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="28" y="42" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="35" y="42" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="42" y="42" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="28" y="49" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="35" y="49" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="42" y="49" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="28" y="56" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="35" y="56" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="42" y="56" width="5" height="5" fill="#60a5fa"/>
                                    <rect x="36" y="60" width="6" height="5" fill="#fbbf24"/>
                                    <path d="M53 40 L53 65 L70 65 L70 45 L68 43 L66 41 L64 40 Z" fill="#ffffff" opacity="0.95"/>
                                    <path d="M64 40 L66 38 L68 36 L70 34 L70 40 Z" fill="#ffffff" opacity="0.95"/>
                                    <line x1="58" y1="45" x2="58" y2="65" stroke="#60a5fa" strokeWidth="2.5"/>
                                    <line x1="65" y1="45" x2="65" y2="65" stroke="#60a5fa" strokeWidth="2.5"/>
                                </svg>
                            </div>
                        </div>
                        <h3>Espace Entreprises</h3>
                        <p>Déposez vos offres, recherchez des profils et gérez les processus de recrutement.</p>
                        {isCompany ? (
                            <div className="card-button-group">
                                <Link to="/company/my-offers" className="service-link">Vos offres</Link>
                                <Link to="/company/create-offer" className="service-link">Créez une offre</Link>
                            </div>
                        ) : (
                            <Link to="/company/create-offer" className="service-link">Publier une offre</Link>
                        )}
                    </div>

                    {/* Espace Administration */}
                    <div className="service-card">
                        <div className="icon-wrapper">
                            <div className="service-icon">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Shield/Admin Icon */}
                                    <path d="M50 20 L65 25 L65 45 Q65 60 50 70 Q35 60 35 45 L35 25 Z" fill="#ffffff" opacity="0.95" stroke="#ffffff" strokeWidth="2"/>
                                    {/* Checkmark inside shield */}
                                    <path d="M42 45 L48 51 L58 38" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    {/* Admin badge */}
                                    <circle cx="50" cy="50" r="12" fill="rgba(255,255,255,0.3)" stroke="#ffffff" strokeWidth="2"/>
                                    <circle cx="50" cy="50" r="6" fill="#2563eb"/>
                                </svg>
                            </div>
                        </div>
                        <h3>Espace Administration</h3>
                        <p>Gérez la plateforme, validez les entreprises et modérez les offres de stage.</p>
                        <Link to="/auth/login?role=admin" className="service-link">Accéder à l'administration</Link>
                    </div>
                </div>
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

        {/* About Section with Stats */}
        <section className="about-section">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <h4>Quelques faits sur nous</h4>
                        <h2>Nous aidons les étudiants à trouver<br/>leur stage idéal.</h2>
                        <p>Notre plateforme facilite la mise en relation entre les étudiants de l'Université de Lorraine et les entreprises. Toutes les offres sont validées par l'administration pour garantir leur qualité et leur conformité.</p>
                        <a href="#stats" className="read-more">En savoir plus</a>

                        <div className="experience-box">
                            <h3>Années d'expérience</h3>
                            <p>Une plateforme éprouvée pour la gestion des stages universitaires. Accédez à toutes les fonctionnalités pour faciliter votre recherche ou votre gestion de stages.</p>
                            <Link to="/offers" className="read-more">Consulter les offres</Link>
                        </div>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <h3>{displayValuePlus(stats.offersCount)}</h3>
                            <h4>Offres disponibles</h4>
                        </div>
                        <div className="stat-box">
                            <h3>{displayValue(stats.companyCount)}</h3>
                            <h4>Entreprises partenaires</h4>
                        </div>
                        <div className="stat-box">
                            <h3>100%</h3>
                            <h4>Satisfaction</h4>
                        </div>
                        <div className="stat-box">
                            <h3>100%</h3>
                            <h4>Sécurisé & Validé</h4>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Stats Section - La plateforme en chiffres */}
        <section id="stats" className="stats-section">
            <div className="container">
                <div className="quick-stats-card">
                    <h3>La plateforme en chiffres</h3>
                    <div className="stats-grid-large">
                        <div className="stat-item-large">
                            <span className="stat-number-large">{displayValuePlus(stats.offersCount)}</span>
                            <span className="stat-label-large">Offres disponibles</span>
                        </div>
                        <div className="stat-item-large">
                            <span className="stat-number-large">{displayValue(stats.companyCount)}</span>
                            <span className="stat-label-large">Entreprises partenaires</span>
                        </div>
                        <div className="stat-item-large">
                            <span className="stat-number-large">100%</span>
                            <span className="stat-label-large">Sécurisé & Validé</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Info Section */}
        <section className="info-section">
            <div className="container">
                <div className="info-card">
                    <h3>Pourquoi utiliser cette plateforme ?</h3>
                    <ul className="info-list">
                        <li>Centralisation de toutes les offres de stage de l'université</li>
                        <li>Validation stricte des entreprises par l'administration</li>
                    </ul>
                    <div>
                        <Link to="/offers" className="btn btn-secondary" style={{ color: 'var(--hp-primary-blue)', borderColor: 'var(--hp-primary-blue)' }}>Accéder aux offres disponibles</Link>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

