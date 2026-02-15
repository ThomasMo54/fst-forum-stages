import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import './HomePage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom';
import OfferService, { type PaginatedOffers } from '../../services/offer.service';
import ApplicationService, { type ApplicationDto } from '../../services/application.service';
import UserService from '../../services/user.service';
import StatsService from '../../services/stats.service';
import { useAuth } from '../../context/AuthContext';
import roles from '../../constants/user_roles';





const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [offers, setOffers] = useState<PaginatedOffers>({
    content: [],
    page: { size: 0, number: 0, totalElements: 0, totalPages: 0 }
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<boolean>(false);
  const [studentApplications, setStudentApplications] = useState<ApplicationDto[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(false);
  const [companyOffers, setCompanyOffers] = useState<PaginatedOffers>({
    content: [],
    page: { size: 0, number: 0, totalElements: 0, totalPages: 0 }
  });
  const [companyApplications, setCompanyApplications] = useState<ApplicationDto[]>([]);
  const [loadingCompanyData, setLoadingCompanyData] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [adminStats, setAdminStats] = useState({
    pendingCompanies: 0,
    offersToModerate: 0,
    activeReports: 0,
    totalUsers: 0,
    totalCompanies: 0,
    totalOffers: 0,
    totalStudents: 0,
    totalApplications: 0
  });
  const [loadingAdminStats, setLoadingAdminStats] = useState<boolean>(false);

  const isStudent = isAuthenticated && user?.roles.includes(roles.STUDENT);
  const isCompany = isAuthenticated && user?.roles.includes(roles.COMPANY);
  const isAdmin = isAuthenticated && user?.roles.includes(roles.ADMIN);

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

  useEffect(() => {
    const fetchStudentApplications = async () => {
      if (isStudent && user?.entityId) {
        setLoadingApplications(true);
        try {
          const applications = await ApplicationService.getAllApplicationForStudent(user.entityId);
          setStudentApplications(applications);
        } catch (e) {
          console.error('Error fetching student applications:', e);
        } finally {
          setLoadingApplications(false);
        }
      }
    };

    void fetchStudentApplications();
  }, [isStudent, user?.entityId]);

  useEffect(() => {
    const fetchStudentName = async () => {
      if (isStudent && user?.entityId && user?.roles) {
        try {
          const name = await UserService.getDisplayName(user.entityId, user.roles);
          setStudentName(name);
        } catch (e) {
          console.error('Error fetching student name:', e);
        }
      }
    };

    void fetchStudentName();
  }, [isStudent, user?.entityId, user?.roles]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (isCompany && user?.entityId && user?.roles) {
        try {
          const name = await UserService.getDisplayName(user.entityId, user.roles);
          setCompanyName(name);
        } catch (e) {
          console.error('Error fetching company name:', e);
        }
      }
    };

    void fetchCompanyName();
  }, [isCompany, user?.entityId, user?.roles]);

  useEffect(() => {
    const fetchAdminName = async () => {
      if (isAdmin && user?.roles) {
        try {
          const name = await UserService.getDisplayName(user.entityId || '', user.roles);
          // getDisplayName retourne "Admin" pour les admins, on l'utilise tel quel
          setAdminName(name);
        } catch (e) {
          console.error('Error fetching admin name:', e);
          // En cas d'erreur, utiliser "Admin" comme fallback
          setAdminName('Admin');
        }
      }
    };

    void fetchAdminName();
  }, [isAdmin, user?.entityId, user?.roles]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (isAdmin) {
        setLoadingAdminStats(true);
        try {
          // Récupérer les statistiques globales
          const [userStats, offerStats, applicationStats] = await Promise.all([
            StatsService.getGlobalUserStats(),
            StatsService.getGlobalOfferStats(),
            StatsService.getGlobalApplicationStats()
          ]);

          setAdminStats({
            pendingCompanies: 0, // À implémenter si endpoint existe
            offersToModerate: 0, // À implémenter si endpoint existe
            activeReports: 0, // À implémenter si endpoint existe
            totalUsers: (userStats.totalStudents || 0) + (userStats.totalCompanies || 0),
            totalCompanies: userStats.totalCompanies || 0,
            totalOffers: offerStats.totalOffers || 0,
            totalStudents: userStats.totalStudents || 0,
            totalApplications: applicationStats.totalApplications || 0
          });
        } catch (e) {
          console.error('Error fetching admin stats:', e);
        } finally {
          setLoadingAdminStats(false);
        }
      }
    };

    void fetchAdminStats();
  }, [isAdmin]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (isCompany && user?.entityId) {
        setLoadingCompanyData(true);
        try {
          // Récupérer les offres de l'entreprise
          const offers = await OfferService.getOffersByCompany(user.entityId);
          setCompanyOffers(offers);

          // Récupérer toutes les candidatures pour toutes les offres de l'entreprise
          const allApplications: ApplicationDto[] = [];
          for (const offer of offers.content) {
            try {
              const applications = await ApplicationService.getAllApplicationsForOffer(offer.id);
              allApplications.push(...applications);
            } catch (e) {
              console.error(`Error fetching applications for offer ${offer.id}:`, e);
            }
          }
          setCompanyApplications(allApplications);
        } catch (e) {
          console.error('Error fetching company data:', e);
        } finally {
          setLoadingCompanyData(false);
        }
      }
    };

    void fetchCompanyData();
  }, [isCompany, user?.entityId]);

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

  const [activeTab, setActiveTab] = useState<string>('students');

  return (
    <div className="home-page">
      <Header />

      <main>
        {/* Hero Section - Masquer pour étudiants, entreprises et admins connectés */}
        {!isStudent && !isCompany && !isAdmin && (
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V6z"/>
                <path d="M12 14l-7-3.18v5.27c0 1.09 3.13 3.91 7 3.91s7-2.82 7-3.91v-5.27z"/>
              </svg>
              Université de Lorraine
            </div>
            
            <h1>Plateforme Stages & Alternances</h1>
           
            
            <p className="hero-description">
              Plateforme officielle de mise en relation entre étudiants et entreprises. 
              Trouvez votre stage idéal ou recrutez vos futurs talents en toute confiance.
            </p>

           
            

            <div className="button-group">
              <Link to="/offers" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Consulter les offres
              </Link>
              <a href="#portals" className="btn btn-secondary">
                En savoir plus
              </a>
            </div>
            </div>
          </section>
        )}

        {/* Services Section - Espaces */}
        <section id="portals" className="services-section">
            <div className="container">
                <div className="section-header">
                    {isStudent && studentName ? (
                        <>
                            <h2>Bonjour {studentName}</h2>
                            <p>Bienvenue dans votre espace étudiant</p>
                        </>
                    ) : isCompany && companyName ? (
                        <>
                            <h2>Bonjour {companyName}</h2>
                            <p>Bienvenue dans votre espace entreprise</p>
                        </>
                    ) : (
                        <>
                            {/* Titre masqué pour les utilisateurs non connectés */}
                        </>
                    )}
                </div>
                <div className="services-grid">
                    {/* Espace Étudiants - Version sans carte */}
                    {(!isAuthenticated || isStudent) && (
                        <div className={`student-space ${!isAuthenticated ? 'flip-card' : ''}`}>
                            {!isAuthenticated ? (
                                // Version visiteur non connecté avec flip
                                <div className="flip-card-inner">
                                    <div className="flip-card-front student-visitor-view">
                                        <div className="student-header">
                                            <h3> Espace Étudiants</h3>
                                            <p>Accédez à des centaines d'offres de stage validées. Gérez vos candidatures et suivez vos conventions en ligne.</p>
                                        </div>
                                        <div className="student-cta">
                                            <Link to="/offers" className="cta-button primary">
                                                Découvrir les offres de stage
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flip-card-back student-visitor-view">
                                        <div className="student-header">
                                            <h3>🎓 Étudiants</h3>
                                            <p>Recherchez votre stage idéal parmi des centaines d'offres validées par l'université. Postulez facilement et suivez vos candidatures en temps réel.</p>
                                        </div>
                                        <div className="student-cta">
                                            <Link to="/offers" className="cta-button primary">
                                                Voir les offres
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Version étudiant connecté
                                <div className="student-connected-view">
                                    <div className="student-header">
                                        <h3>Votre activité</h3>
                                        <p>Consultez les offres de stage disponibles et suivez vos candidatures en cours.</p>
                                    </div>

                                    {/* Boutons d'action principaux */}
                                    <div className="student-actions">
                                        <Link to="/offers" className="action-button offers">
                                            <div className="action-content">
                                                <span className="action-label">Offres disponibles</span>
                                                <span className="action-count">{displayValuePlus(stats.offersCount)}</span>
                                            </div>
                                            <span className="action-arrow">→</span>
                                        </Link>
                                        
                                        <Link to="/student/my-applications" className="action-button applications">
                                            <div className="action-content">
                                                <span className="action-label">Mes postulations</span>
                                                <span className="action-count">
                                                    {loadingApplications ? '...' : studentApplications.length}
                                                </span>
                                            </div>
                                            <span className="action-arrow">→</span>
                                        </Link>
                                    </div>

                                    {/* Graphiques de statistiques */}
                                    <div className="student-charts">
                                        <div className="chart-container">
                                            <h4>Aperçu de votre activité</h4>
                                            <div className="charts-grid">
                                                {/* Chart 1: Offres vs Postulations */}
                                                <div className="chart-item">
                                                    <div className="chart-header">
                                                        <span className="chart-title">Vue d'ensemble</span>
                                                    </div>
                                                    <div className="bar-chart">
                                                        <div className="bar-group">
                                                            <div className="bar-wrapper">
                                                                <div 
                                                                    className="bar bar-offers" 
                                                                    style={{height: `${Math.min((stats.offersCount / 100) * 100, 100)}%`}}
                                                                >
                                                                    <span className="bar-value">{displayValuePlus(stats.offersCount)}</span>
                                                                </div>
                                                                <span className="bar-label">Offres</span>
                                                            </div>
                                                            <div className="bar-wrapper">
                                                                <div 
                                                                    className="bar bar-applications" 
                                                                    style={{height: `${Math.min((studentApplications.length / 20) * 100, 100)}%`}}
                                                                >
                                                                    <span className="bar-value">{studentApplications.length}</span>
                                                                </div>
                                                                <span className="bar-label">Postulations</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chart 2: Progress circular */}
                                                <div className="chart-item">
                                                    <div className="chart-header">
                                                        <span className="chart-title">Taux de candidature</span>
                                                    </div>
                                                    <div className="progress-chart">
                                                        <svg viewBox="0 0 100 100" className="circular-chart">
                                                            <circle 
                                                                className="circle-bg" 
                                                                cx="50" 
                                                                cy="50" 
                                                                r="40"
                                                            />
                                                            <circle 
                                                                className="circle-progress" 
                                                                cx="50" 
                                                                cy="50" 
                                                                r="40"
                                                                style={{
                                                                    strokeDasharray: `${stats.offersCount > 0 ? ((studentApplications.length / stats.offersCount) * 251.2).toFixed(2) : 0} 251.2`
                                                                }}
                                                            />
                                                            <text x="50" y="50" className="percentage-text">
                                                                {stats.offersCount > 0 
                                                                    ? `${((studentApplications.length / stats.offersCount) * 100).toFixed(0)}%`
                                                                    : '0%'
                                                                }
                                                            </text>
                                                        </svg>
                                                        <p className="chart-caption">Offres postulées</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Espace Entreprises - Version sans carte */}
                    {(!isAuthenticated || isCompany) && (
                        <div className={`student-space company-space ${!isAuthenticated ? 'flip-card' : ''}`}>
                            {!isAuthenticated ? (
                                // Version visiteur non connecté avec flip
                                <div className="flip-card-inner">
                                    <div className="flip-card-front student-visitor-view">
                                        <div className="student-header">
                                            <h3> Espace Entreprises</h3>
                                            <p>Publiez vos offres de stage et connectez-vous avec les meilleurs talents. Gérez vos candidatures facilement.</p>
                                        </div>
                                        <div className="student-cta">
                                            <Link to="/company/create-offer" className="cta-button primary">
                                                Publier une offre
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flip-card-back student-visitor-view">
                                        <div className="student-header">
                                            <h3>🏢 Entreprises</h3>
                                            <p>Recrutez les meilleurs étudiants de l'Université de Lorraine. Publiez vos offres, recevez des candidatures qualifiées et gérez vos recrutements efficacement.</p>
                                        </div>
                                        <div className="student-cta">
                                            <Link to="/company/create-offer" className="cta-button primary">
                                                Créer une offre
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Version entreprise connectée
                                <div className="student-connected-view">
                                    <div className="student-header">
                                        <h3>Votre activité</h3>
                                        <p>Gérez vos offres de stage et suivez les candidatures reçues.</p>
                                    </div>

                                    {/* Boutons d'action principaux */}
                                    <div className="student-actions">
                                        <Link to="/company/my-offers" className="action-button offers">
                                            <div className="action-content">
                                                <span className="action-label">Mes offres</span>
                                                <span className="action-count">
                                                    {loadingCompanyData ? '...' : companyOffers.page.totalElements}
                                                </span>
                                            </div>
                                            <span className="action-arrow">→</span>
                                        </Link>
                                        
                                        <Link to="/company/create-offer" className="action-button applications">
                                            <div className="action-content">
                                                <span className="action-label">Candidatures reçues</span>
                                                <span className="action-count">
                                                    {loadingCompanyData ? '...' : companyApplications.length}
                                                </span>
                                            </div>
                                            <span className="action-arrow">→</span>
                                        </Link>
                                    </div>

                                    {/* Graphiques de statistiques */}
                                    <div className="student-charts">
                                        <div className="chart-container">
                                            <h4>Aperçu de votre activité</h4>
                                            <div className="charts-grid">
                                                {/* Chart 1: Offres vs Candidatures */}
                                                <div className="chart-item">
                                                    <div className="chart-header">
                                                        <span className="chart-title">Vue d'ensemble</span>
                                                    </div>
                                                    <div className="bar-chart">
                                                        <div className="bar-group">
                                                            <div className="bar-wrapper">
                                                                <div 
                                                                    className="bar bar-offers" 
                                                                    style={{height: `${Math.min((companyOffers.page.totalElements / 10) * 100, 100)}%`}}
                                                                >
                                                                    <span className="bar-value">{companyOffers.page.totalElements}</span>
                                                                </div>
                                                                <span className="bar-label">Offres</span>
                                                            </div>
                                                            <div className="bar-wrapper">
                                                                <div 
                                                                    className="bar bar-applications" 
                                                                    style={{height: `${Math.min((companyApplications.length / 50) * 100, 100)}%`}}
                                                                >
                                                                    <span className="bar-value">{companyApplications.length}</span>
                                                                </div>
                                                                <span className="bar-label">Candidatures</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chart 2: Progress circular */}
                                                <div className="chart-item">
                                                    <div className="chart-header">
                                                        <span className="chart-title">Taux de candidature</span>
                                                    </div>
                                                    <div className="progress-chart">
                                                        <svg viewBox="0 0 100 100" className="circular-chart">
                                                            <circle 
                                                                className="circle-bg" 
                                                                cx="50" 
                                                                cy="50" 
                                                                r="40"
                                                            />
                                                            <circle 
                                                                className="circle-progress" 
                                                                cx="50" 
                                                                cy="50" 
                                                                r="40"
                                                                style={{
                                                                    strokeDasharray: `${companyOffers.page.totalElements > 0 ? ((companyApplications.length / (companyOffers.page.totalElements * 5)) * 251.2).toFixed(2) : 0} 251.2`
                                                                }}
                                                            />
                                                            <text x="50" y="50" className="percentage-text">
                                                                {companyOffers.page.totalElements > 0 
                                                                    ? `${((companyApplications.length / (companyOffers.page.totalElements * 5)) * 100).toFixed(0)}%`
                                                                    : '0%'
                                                                }
                                                            </text>
                                                        </svg>
                                                        <p className="chart-caption">Candidatures par offre</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Espace Administration */}
                    {isAdmin && (
                        <div className="admin-space">
                            <div className="admin-connected-view">
                                <div className="admin-header">
                                    <h3>Bonjour {adminName || 'Admin'}</h3>
                                    <p>Gérez la plateforme, validez les entreprises et modérez les offres de stage.</p>
                                </div>

                                {/* Navigation secondaire */}
                                <div className="admin-navigation">
                                    <Link to="/admin/stats" className="admin-nav-link">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                                        </svg>
                                        <span>Tableau de bord</span>
                                    </Link>
                                    <Link to="/admin/users" className="admin-nav-link">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                                        </svg>
                                        <span>Utilisateurs</span>
                                    </Link>
                                </div>

                                {/* Statistiques détaillées */}
                                <div className="admin-stats-section">
                                    <h4>Statistiques de la plateforme</h4>
                                    {loadingAdminStats ? (
                                        <div className="admin-stats-loading">
                                            <div className="loading-spinner"></div>
                                            <p>Chargement des statistiques...</p>
                                        </div>
                                    ) : (
                                        <div className="admin-stats-grid">
                                            <Link to="/admin/users" className="admin-stat-card clickable">
                                                <div className="stat-header">
                                                    <span className="stat-icon blue">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="currentColor"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-value">{adminStats.totalCompanies || stats.companyCount}</span>
                                                    <span className="stat-label">Entreprises inscrites</span>
                                                </div>
                                            </Link>

                                            <Link to="/admin/stats" className="admin-stat-card clickable">
                                                <div className="stat-header">
                                                    <span className="stat-icon purple">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="currentColor"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-value">{adminStats.totalOffers || stats.offersCount}</span>
                                                    <span className="stat-label">Offres publiées</span>
                                                </div>
                                            </Link>

                                            <Link to="/admin/users" className="admin-stat-card clickable">
                                                <div className="stat-header">
                                                    <span className="stat-icon green">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-value">{adminStats.totalStudents || 0}</span>
                                                    <span className="stat-label">Étudiants actifs</span>
                                                </div>
                                            </Link>

                                            <Link to="/admin/stats" className="admin-stat-card clickable">
                                                <div className="stat-header">
                                                    <span className="stat-icon orange">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-value">{adminStats.totalApplications || 0}</span>
                                                    <span className="stat-label">Candidatures totales</span>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </section>

        {/* Section À propos - Tabs - Masquer pour étudiants, entreprises et admins connectés */}
        {!isStudent && !isCompany && !isAdmin && (
        <section className="about-section">
          <div className="container">
            <div className="section-header">
              <h4>À PROPOS DE LA PLATEFORME</h4>
             
            </div>

            <div className="tabs-container">
              <div className="tabs-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                  data-tab="students"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Étudiants
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('companies')}
                  data-tab="companies"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Entreprises
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'platform' ? 'active' : ''}`}
                  onClick={() => setActiveTab('platform')}
                  data-tab="platform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  La plateforme
                </button>
              </div>

              <div className="tabs-content">
                <div className={`tab-panel ${activeTab === 'students' ? 'active' : ''}`} id="students">
                  <div className="tab-content-grid">
                    <div className="tab-text">
                      <h3>Pour les étudiants</h3>
                      <p>
                        Accédez à des centaines d'offres de stage validées, gérez vos 
                        candidatures en un seul endroit et bénéficiez d'un accompagnement 
                        personnalisé tout au long de votre recherche.
                      </p>
                      <ul className="feature-list">
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Recherche avancée par critères
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Suivi de vos candidatures
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Validation administrative simplifiée
                        </li>
                      </ul>
                    </div>
                    <div className="tab-stats">
                      <div className="stat-card">
                        <div className="stat-value">{displayValuePlus(stats.offersCount)}</div>
                        <div className="stat-label">Offres disponibles</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">15k+</div>
                        <div className="stat-label">Étudiants inscrits</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`tab-panel ${activeTab === 'companies' ? 'active' : ''}`} id="companies">
                  <div className="tab-content-grid">
                    <div className="tab-text">
                      <h3>Pour les entreprises</h3>
                      <p>
                        Diffusez vos offres auprès d'un vivier qualifié d'étudiants, 
                        gérez vos recrutements efficacement et bénéficiez de la 
                        caution de l'Université de Lorraine.
                      </p>
                      <ul className="feature-list">
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Publication d'offres illimitées
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accès aux profils étudiants
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Gestion centralisée des candidatures
                        </li>
                      </ul>
                    </div>
                    <div className="tab-stats">
                      <div className="stat-card">
                        <div className="stat-value">{displayValue(stats.companyCount)}</div>
                        <div className="stat-label">Entreprises partenaires</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">Offres validées</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`tab-panel ${activeTab === 'platform' ? 'active' : ''}`} id="platform">
                  <div className="tab-content-grid">
                    <div className="tab-text">
                      <h3>Une plateforme sécurisée</h3>
                      <p>
                        Développée par et pour l'Université de Lorraine, notre plateforme 
                        garantit la qualité des offres et la sécurité de vos données 
                        personnelles.
                      </p>
                      <ul className="feature-list">
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Validation institutionnelle
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Données sécurisées (RGPD)
                        </li>
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Support administratif dédié
                        </li>
                      </ul>
                    </div>
                    <div className="tab-stats">
                      <div className="stat-card modern">
                        <div className="stat-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="stat-value">100%</div>
                        <div className="stat-label">Sécurisé & Validé</div>
                      </div>
                      <div className="stat-card modern">
                        <div className="stat-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="stat-value">24/7</div>
                        <div className="stat-label">Disponibilité</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </section>
        )}

        {/* Info Section - Masquer pour étudiants, entreprises et admins connectés */}
        {!isStudent && !isCompany && !isAdmin && (
        <section className="info-section">
            <div className="container">
                <div className="info-card">
            <h3>Pourquoi utiliser cette plateforme ?</h3>
            <ul className="info-list">
                        <li>Centralisation de toutes les offres de stage de l'université</li>
              <li>Validation stricte des entreprises par l'administration</li>
            </ul>
                    <div>
                        <Link to="/offers" className="btn btn-info-primary">Accéder aux offres disponibles</Link>
                    </div>
                </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

