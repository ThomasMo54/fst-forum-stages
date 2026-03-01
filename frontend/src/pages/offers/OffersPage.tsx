import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/global.css';
import './OffersPage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Button from '../../components/button/Button';
import OfferService, { type PaginatedOffers, type OfferDto } from '../../services/offer.service';
import CompanyService from '../../services/company.service';
import type { ApplicationDto } from '../../services/application.service';
import ApplicationService from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import user_roles from "../../constants/user_roles.ts";
import { Pagination } from "../../components/pagination/Pagination.tsx";
import OffersMap from './OffersMap';

const formatDate = (date?: string | null) => {
  if (!date) return 'Non renseignée';
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('fr-FR');
};

type ViewMode = 'list' | 'map';
type OfferFiltersState = {
  keyword: string;
  city: string;
  studyLevel: string;
  remoteWorkPolicy: string;
  duration: string;
};

const initialFilters: OfferFiltersState = {
  keyword: '',
  city: '',
  studyLevel: '',
  remoteWorkPolicy: '',
  duration: ''
};

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<PaginatedOffers>({
    content: [],
    page: { size: 0, number: 0, totalElements: 0, totalPages: 0 }
  });
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [companyCities, setCompanyCities] = useState<Record<string, string>>({});
  const [companyAddresses, setCompanyAddresses] = useState<Record<string, string>>({});
  const [companyPostalCodes, setCompanyPostalCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  const [filters, setFilters] = useState<OfferFiltersState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<OfferFiltersState>(initialFilters);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);
  const [studentApplications, setStudentApplications] = useState<ApplicationDto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1);

  const fetchOffersAndApplications = async (page: number) => {
    setLoading(true);
    setListError('');
    try {
      const data = await OfferService.getAllOffers(page, {
        keyword: filters.keyword,
        city: filters.city,
        studyLevel: filters.studyLevel,
        remoteWorkPolicy: filters.remoteWorkPolicy,
        duration: filters.duration
      });
      setOffers(data);

      const companyIds = [...new Set(data.content.map(offer => offer.companyId))];

      const names: Record<string, string> = {};
      const cities: Record<string, string> = {};
      const addresses: Record<string, string> = {};
      const postalCodes: Record<string, string> = {};

      await Promise.all(
          companyIds.map(async id => {
            try {
              const company = await CompanyService.getCompanyById(id);
              names[id] = company.name;
              cities[id] = company.city || 'Non renseigné';
              addresses[id] = company.streetAddress || '';
              postalCodes[id] = company.postalCode || '';
            } catch (e) {
              console.error(`Could not fetch company for ID ${id}`, e);
              names[id] = `Entreprise #${id}`;
              cities[id] = 'Non renseigné';
            }
          })
      );

      setCompanyNames(names);
      setCompanyCities(cities);
      setCompanyAddresses(addresses);
      setCompanyPostalCodes(postalCodes);

      if(user) {
        if (user.roles.includes(user_roles.STUDENT)) {
          const applications = await ApplicationService.getAllApplicationForStudent(user.entityId);
          setStudentApplications(applications);
        } else {
          setStudentApplications([]);
        }
      }
    } catch (err) {
      setListError("Impossible de récupérer les offres pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOffersAndApplications(currentPage - 1);
  }, [currentPage, filters]);

  const activeFilterCount = [
    filters.keyword,
    filters.city,
    filters.studyLevel,
    filters.remoteWorkPolicy,
    filters.duration
  ].filter((value) => value.trim().length > 0).length;

  const resetToFirstPage = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    setSearchParams(params);
  };

  const updateMainFilter = (field: keyof OfferFiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    if (currentPage !== 1) {
      resetToFirstPage();
    }
  };

  const openFiltersModal = () => {
    setDraftFilters(filters);
    setIsFiltersModalOpen(true);
  };

  const applyAdvancedFilters = () => {
    setFilters(draftFilters);
    if (currentPage !== 1) {
      resetToFirstPage();
    }
    setIsFiltersModalOpen(false);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setDraftFilters(initialFilters);
    if (currentPage !== 1) {
      resetToFirstPage();
    }
    setIsFiltersModalOpen(false);
  };

  const handleApplyRedirect = (offer: OfferDto) => {
    setSelectedOffer(null);
    navigate(`/offers/${offer.id}/apply`, {
      state: {
        offer,
        companyName: companyNames[offer.companyId] || `Entreprise #${offer.companyId}`
      }
    });
  };

  return (
      <div className="page-wrapper">
        <Header />

        <main className="offers-main">
          <div className="container">
            <section className="offers-hero">
              <div>
                <p className="eyebrow">Offres de stage</p>
                <h1>Explorez et publiez des opportunités</h1>
                <p className="lead">
                  Retrouvez les offres validées par l'équipe FST.
                </p>
              </div>

              <div className="hero-metrics">
                <div className="metric-card">
                  <span className="metric-number">{offers.page.totalElements}</span>
                  <span className="metric-label">Offres disponibles</span>
                </div>
                <div className="metric-card">
                <span className="metric-number">
                  {offers.content.filter((offer) => !!offer.remoteWorkPolicy).length}
                </span>
                  <span className="metric-label">Offres avec télétravail</span>
                </div>
              </div>
            </section>

            <section className="offers-section">
              <div className="section-header">
                <div className="offers-filter-shell">
                  <div className="offers-filter-top">
                    <div className="offers-filter-main-search">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input
                          type="text"
                          placeholder="Rechercher par offre, entreprise ou mot-cle..."
                          value={filters.keyword}
                          onChange={(e) => updateMainFilter('keyword', e.target.value)}
                      />
                    </div>

                    <div className="filter-static-pill">
                      <i className="fa-solid fa-briefcase"></i>
                      <span>Stage</span>
                    </div>

                    <div className="filter-chip">{activeFilterCount} x</div>

                    <div className="offers-filter-city">
                      <i className="fa-solid fa-location-dot"></i>
                      <input
                          type="text"
                          placeholder="Ville, departement..."
                          value={filters.city}
                          onChange={(e) => updateMainFilter('city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="offers-filter-bottom">
                    <button type="button" className="all-filters-btn" onClick={openFiltersModal}>
                      <i className="fa-solid fa-filter"></i>
                      Tous les filtres
                      <span className="all-filters-count">{activeFilterCount}</span>
                    </button>

                    <button
                        type="button"
                        className="refresh-search-btn"
                        onClick={() => void fetchOffersAndApplications(currentPage - 1)}
                    >
                      <i className="fa-regular fa-bell"></i>
                      Actualiser cette recherche
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggle Liste / Carte */}
              <div className="view-toggle-section">
                <div className="view-toggle">
                  <button
                      className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                  >
                    <i className="fa-solid fa-list"></i>
                    Liste
                  </button>
                  <button
                      className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                      onClick={() => setViewMode('map')}
                  >
                    <i className="fa-solid fa-map"></i>
                    Carte
                  </button>
                </div>
              </div>

              {listError && (
                  <div className="error-message inline-error">{listError}</div>
              )}

              {loading ? (
                  <div className="offers-linear-list loading">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="offer-list-item skeleton-item">
                          <div className="skeleton-line" />
                          <div className="skeleton-line short" />
                        </div>
                    ))}
                  </div>
              ) : offers.content.length === 0 ? (
                  <div className="empty-state">
                    <p>Aucune offre ne correspond à votre recherche.</p>
                    <Button variant="secondary" onClick={clearAllFilters}>
                      Réinitialiser les filtres
                    </Button>
                  </div>
              ) : (
                  <>
                    {/* Vue Carte */}
                    {viewMode === 'map' && (
                        <OffersMap
                            offers={offers.content}
                            companyNames={companyNames}
                            companyCities={companyCities}
                            companyAddresses={companyAddresses}
                            companyPostalCodes={companyPostalCodes}
                            onOfferClick={setSelectedOffer}
                        />
                    )}

                    {/* Vue Liste */}
                    {viewMode === 'list' && (
                        <div className="offers-linear-list">
                          {offers.content.map((offer) => (
                              <div
                                  key={offer.id}
                                  className="offer-list-item"
                                  onClick={() => setSelectedOffer(offer)}
                              >
                                <div className="offer-item-content">
                                  <div className="offer-item-primary">
                                    <h3 className="offer-title">{offer.title}</h3>
                                    <span className="offer-company">
                              {companyNames[offer.companyId] || `Entreprise #${offer.companyId}`}
                            </span>
                                  </div>

                                  <div className="offer-location">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>{companyCities[offer.companyId] || 'Non renseigné'}</span>
                                  </div>

                                  <div className="detail-pill date">
                                    <i className="fa-regular fa-calendar"></i>
                                    <span>{formatDate(offer.internshipStartDate)}</span>
                                  </div>

                                  <div className="detail-pill duration">
                                    <i className="fa-regular fa-clock"></i>
                                    <span>{offer.internshipDuration || 'N/A'}</span>
                                  </div>

                                  <div className="detail-pill salary">
                                    <i className="fa-solid fa-euro-sign"></i>
                                    <span>{offer.salary || 'N/A'}</span>
                                  </div>

                                  <div className="offer-item-tags">
                                    {(offer.tags ?? []).slice(0, 3).map((tag) => (
                                        <span key={tag} className="tag">
                                {tag}
                              </span>
                                    ))}
                                    {(offer.tags ?? []).length > 3 && (
                                        <span className="tag-more">+{(offer.tags ?? []).length - 3}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}

                    {isFiltersModalOpen && (
                        <div className="filters-modal-overlay" onClick={() => setIsFiltersModalOpen(false)}>
                          <div className="filters-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="filters-modal-header">
                              <h3>Plus de filtres</h3>
                              <button
                                  className="filters-close"
                                  type="button"
                                  onClick={() => setIsFiltersModalOpen(false)}
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>

                            <div className="filters-grid">
                              <label>
                                Niveau d'etude
                                <select
                                    value={draftFilters.studyLevel}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, studyLevel: e.target.value }))}
                                >
                                  <option value="">Tous</option>
                                  <option value="Bac+2">Bac+2</option>
                                  <option value="Bac+3">Bac+3</option>
                                  <option value="Bac+4">Bac+4</option>
                                  <option value="Bac+5">Bac+5</option>
                                </select>
                              </label>

                              <label>
                                Duree
                                <select
                                    value={draftFilters.duration}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, duration: e.target.value }))}
                                >
                                  <option value="">Toutes</option>
                                  <option value="1">1 mois</option>
                                  <option value="2">2 mois</option>
                                  <option value="3">3 mois</option>
                                  <option value="4">4 mois</option>
                                  <option value="5">5 mois</option>
                                  <option value="6">6 mois</option>
                                  <option value="12">12 mois</option>
                                </select>
                              </label>

                              <label>
                                Teletravail
                                <select
                                    value={draftFilters.remoteWorkPolicy}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, remoteWorkPolicy: e.target.value }))}
                                >
                                  <option value="">Tous</option>
                                  <option value="Oui">Oui</option>
                                  <option value="Non">Non</option>
                                  <option value="Hybride">Hybride</option>
                                </select>
                              </label>
                            </div>

                            <div className="filters-modal-actions">
                              <Button variant="secondary" onClick={clearAllFilters}>Tout effacer</Button>
                              <Button onClick={applyAdvancedFilters}>Appliquer</Button>
                            </div>
                          </div>
                        </div>
                    )}

                    {/* Modal (commun aux deux vues) */}
                    {selectedOffer && (
                        <div className="offer-modal-overlay" onClick={() => setSelectedOffer(null)}>
                          <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                              <div>
                                <div className="modal-top-info">
                                  <h3 className="modal-title">{selectedOffer.title}</h3>
                                  <span className="offer-company">
                              {companyNames[selectedOffer.companyId] ||
                                  `Entreprise #${selectedOffer.companyId}`}
                            </span>
                                </div>
                                <div className="modal-location">
                                  <i className="fa-solid fa-location-dot"></i>{' '}
                                  {companyCities[selectedOffer.companyId] || 'Non renseigné'}
                                </div>
                              </div>

                              <div className="modal-actions">
                                <Button size="small" variant="secondary" onClick={() => setSelectedOffer(null)}>
                                  Fermer
                                </Button>

                                {user && user.roles.includes(user_roles.STUDENT) ? (
                                    <>
                                      {studentApplications.find((app) => app.offerId === selectedOffer.id) ? (
                                          <span className="applied-badge">
                                  <i className="fa-solid fa-circle-check"></i> Candidature envoyée
                                </span>
                                      ) : (
                                          <Button size="small" onClick={() => handleApplyRedirect(selectedOffer)}>
                                            Je postule
                                          </Button>
                                      )}
                                    </>
                                ) : null}
                              </div>
                            </div>

                            <div className="offer-meta-grid">
                              <div className="meta-item">
                                <span><i className="fa-regular fa-calendar"></i> Début</span>
                                <strong>{formatDate(selectedOffer.internshipStartDate)}</strong>
                              </div>
                              <div className="meta-item">
                                <span><i className="fa-regular fa-clock"></i> Durée</span>
                                <strong>{selectedOffer.internshipDuration || 'Non renseignée'}</strong>
                              </div>
                              <div className="meta-item">
                                <span><i className="fa-solid fa-euro-sign"></i> Salaire</span>
                                <strong>{selectedOffer.salary || 'Non renseigné'}</strong>
                              </div>
                              <div className="meta-item">
                                <span><i className="fa-solid fa-house-laptop"></i> Télétravail</span>
                                <strong>{selectedOffer.remoteWorkPolicy || 'À définir'}</strong>
                              </div>
                              <div className="meta-item">
                                <span><i className="fa-solid fa-graduation-cap"></i> Niveau</span>
                                <strong>{selectedOffer.studyLevel || 'Ouvert'}</strong>
                              </div>
                              <div className="meta-item">
                                <span><i className="fa-regular fa-hourglass-half"></i> Limite</span>
                                <strong>
                                  {selectedOffer.limitApplicationDate
                                      ? formatDate(selectedOffer.limitApplicationDate)
                                      : 'Sans limite'}
                                </strong>
                              </div>
                            </div>

                            <div className="modal-description-section">
                              <h4>Description de l'offre</h4>
                              <p className="offer-description">{selectedOffer.description}</p>
                            </div>

                            {(selectedOffer.tags ?? []).length > 0 && (
                                <div className="modal-tags-section">
                                  <h4>Compétences recherchées</h4>
                                  <div className="tags">
                                    {(selectedOffer.tags ?? []).map((tag) => (
                                        <span key={tag} className="tag">
                                {tag}
                              </span>
                                    ))}
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                    )}
                  </>
              )}
            </section>

            {offers.page.totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={offers.page.totalPages} />
            )}
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default OffersPage;
