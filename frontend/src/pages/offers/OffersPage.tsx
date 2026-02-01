import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.css';
import './OffersPage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Button from '../../components/button/Button';
import OfferService, { type OfferDto } from '../../services/offer.service';
import CompanyService from '../../services/company.service';
import type { ApplicationDto } from '../../services/application.service';
import ApplicationService from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import user_roles from "../../constants/user_roles.ts";

const formatDate = (date?: string | null) => {
  if (!date) return 'Non renseignée';
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('fr-FR');
};

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [companyCities, setCompanyCities] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [studyLevelFilter, setStudyLevelFilter] = useState<string>('');
  const [remotePolicyFilter, setRemotePolicyFilter] = useState<string>('any');
  const [startDateFrom, setStartDateFrom] = useState<string>('');
  const [startDateTo, setStartDateTo] = useState<string>('');
  const [limitDateFrom, setLimitDateFrom] = useState<string>('');
  const [limitDateTo, setLimitDateTo] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);
  const [studentApplications, setStudentApplications] = useState<ApplicationDto[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void  fetchOffersAndApplications();
  }, []);

  const fetchOffersAndApplications = async () => {
    setLoading(true);
    setListError('');
    try {
      const data = await OfferService.getAllOffers();
      setOffers(data);
      const companyIds = [...new Set(data.map(offer => offer.companyId))];
      const names: Record<string, string> = {};
      const cities: Record<string, string> = {};
      await Promise.all(companyIds.map(async id => {
        try {
          const company = await CompanyService.getCompanyById(id);
          names[id] = company.name;
          cities[id] = company.city || 'Non renseigné';
        } catch (e) {
          console.error(`Could not fetch company name for ID ${id}`, e);
          names[id] = `Entreprise #${id}`;
        }
      }));
      setCompanyNames(names);
      setCompanyCities(cities);
      if (user?.entityId) {
        const applications = await ApplicationService.getAllApplicationForStudent(user.entityId);
        setStudentApplications(applications);
      }
    } catch (err) {
      setListError("Impossible de récupérer les offres pour le moment.");
    } finally {
      setLoading(false);
    }
  };


  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTagFilter('');
    setStudyLevelFilter('');
    setRemotePolicyFilter('any');
    setStartDateFrom('');
    setStartDateTo('');
    setLimitDateFrom('');
    setLimitDateTo('');
  };

  const filteredOffers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const tagTerm = tagFilter.toLowerCase();
    const startFromDate = parseDate(startDateFrom);
    const startToDate = parseDate(startDateTo);
    const limitFromDate = parseDate(limitDateFrom);
    const limitToDate = parseDate(limitDateTo);

    return offers.filter((offer) => {
      const hasTextMatch = !term
        || offer.title.toLowerCase().includes(term)
        || offer.description.toLowerCase().includes(term)
        || (companyNames[offer.companyId] || '').toLowerCase().includes(term)
        || (offer.tags ?? []).some((tag) => tag.toLowerCase().includes(term));

      const hasTagFilterMatch = !tagTerm
        || (offer.tags ?? []).some((tag) => tag.toLowerCase().includes(tagTerm));

      const hasStudyLevelMatch = !studyLevelFilter
        || (offer.studyLevel || '').toLowerCase().includes(studyLevelFilter.toLowerCase());

      const hasRemotePolicyMatch =
        remotePolicyFilter === 'any'
        || (remotePolicyFilter === 'remote' && !!offer.remoteWorkPolicy)
        || (remotePolicyFilter === 'onsite' && !offer.remoteWorkPolicy);

      const offerStartDate = parseDate(offer.internshipStartDate);
      const hasStartDateMatch = (!startFromDate || (offerStartDate && offerStartDate >= startFromDate))
        && (!startToDate || (offerStartDate && offerStartDate <= startToDate));

      const offerLimitDate = parseDate(offer.limitApplicationDate);
      const hasLimitDateMatch = (!limitFromDate || (offerLimitDate && offerLimitDate >= limitFromDate))
        && (!limitToDate || (offerLimitDate && offerLimitDate <= limitToDate));

      return hasTextMatch
        && hasTagFilterMatch
        && hasStudyLevelMatch
        && hasRemotePolicyMatch
        && hasStartDateMatch
        && hasLimitDateMatch;
    });
  }, [
    offers,
    searchTerm,
    tagFilter,
    studyLevelFilter,
    remotePolicyFilter,
    startDateFrom,
    startDateTo,
    limitDateFrom,
    limitDateTo,
    companyNames
  ]);

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
      <Header/>

      <main className="offers-main">
        <div className="container">
          <section className="offers-hero">
            <div>
              <p className="eyebrow">Offres de stage</p>
              <h1>Explorez et publiez des opportunités</h1>
              <p className="lead">
                Retrouvez les offres validées par l&apos;équipe FST.
              </p>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <span className="metric-number">{offers.length}</span>
                <span className="metric-label">Offres disponibles</span>
              </div>
              <div className="metric-card">
                <span className="metric-number">
                  {(offers.filter((offer) => !!offer.remoteWorkPolicy).length || 0)}
                </span>
                <span className="metric-label">Offres avec télétravail</span>
              </div>
            </div>
          </section>

          <section className="offers-section">
            <div className="section-header">
              <div>
                <p className="eyebrow">Catalogue</p>
                <h2>Les dernières offres publiées</h2>
              </div>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Rechercher une offre, une entreprise ou un tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button size="small" variant="secondary" onClick={() => void fetchOffersAndApplications()}>
                  Actualiser
                </Button>
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-bar-main">
                <div className="filter-pill">
                  <span className="filter-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79L20 20.5 21.5 19l-6-5zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par offre, entreprise ou tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-pill">
                  <span className="filter-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M20 10v4a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
                      <path d="M12 8h6" />
                      <path d="M12 12h4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Mots-clés"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  />
                </div>

                <div className="filter-pill">
                  <span className="filter-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M3 21h18" />
                      <path d="M5 21V7l7-4 7 4v14" />
                      <path d="M9 21v-6h6v6" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Niveau d'étude"
                    value={studyLevelFilter}
                    onChange={(e) => setStudyLevelFilter(e.target.value)}
                  />
                </div>

                <div className="filter-pill">
                  <span className="filter-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                    </svg>
                  </span>
                  <select value={remotePolicyFilter} onChange={(e) => setRemotePolicyFilter(e.target.value)}>
                    <option value="any">T&eacute;l&eacute;travail</option>
                    <option value="remote">Avec t&eacute;l&eacute;travail</option>
                    <option value="onsite">Sans t&eacute;l&eacute;travail</option>
                  </select>
                </div>
              </div>

              <div className="filter-bar-actions">
                <button
                  type="button"
                  className="filter-pill-action"
                  onClick={() => setShowAdvancedFilters(true)}
                >
                  <span className="filter-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M3 5h18" />
                      <path d="M6 12h12" />
                      <path d="M10 19h4" />
                    </svg>
                  </span>
                  Tous les filtres
                </button>
                <button type="button" className="filter-reset" onClick={resetFilters}>
                  R&eacute;initialiser
                </button>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="filter-modal-overlay" onClick={() => setShowAdvancedFilters(false)}>
                <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-modal-header">
                    <div>
                      <p className="eyebrow">Plus de critères</p>
                      <h3>Affinez votre recherche</h3>
                    </div>
                    <button type="button" className="filter-modal-close" onClick={() => setShowAdvancedFilters(false)}>
                      ✕
                    </button>
                  </div>

                  <div className="filter-modal-grid">
                    <div className="filter-field">
                      <label>D&eacute;but (du / au)</label>
                      <div className="filter-range">
                        <input type="date" value={startDateFrom} onChange={(e) => setStartDateFrom(e.target.value)} />
                        <input type="date" value={startDateTo} onChange={(e) => setStartDateTo(e.target.value)} />
                      </div>
                    </div>
                    <div className="filter-field">
                      <label>Date limite (du / au)</label>
                      <div className="filter-range">
                        <input type="date" value={limitDateFrom} onChange={(e) => setLimitDateFrom(e.target.value)} />
                        <input type="date" value={limitDateTo} onChange={(e) => setLimitDateTo(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="filter-modal-actions">
                    <button type="button" className="filter-reset" onClick={resetFilters}>
                      Tout effacer
                    </button>
                    <Button size="small" onClick={() => setShowAdvancedFilters(false)}>
                      Appliquer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {listError && (
              <div className="error-message inline-error">
                {listError}
              </div>
            )}

            {loading ? (
              <div className="offers-linear-list loading">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="offer-list-item skeleton-item">
                        <div className="skeleton-line"/>
                        <div className="skeleton-line short"/>
                    </div>
                ))}
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="empty-state">
                <p>Aucune offre ne correspond à votre recherche.</p>
                <Button variant="secondary" onClick={() => setSearchTerm('')}>
                  Réinitialiser la recherche
                </Button>
              </div>
            ) : (
              <>
                <div className="offers-linear-list">
                    {filteredOffers.map((offer) => (
                        <div key={offer.id} className="offer-list-item" onClick={() => setSelectedOffer(offer)}>
                            <div className="offer-item-content">
                                <div className="offer-item-primary">
                                    <h3 className="offer-title">{offer.title}</h3>
                                    <span className="offer-company">{companyNames[offer.companyId] || `Entreprise #${offer.companyId}`}</span>
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
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {(offer.tags ?? []).length > 3 && (
                                        <span className="tag-more">+{(offer.tags ?? []).length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedOffer && (
                  <div className="offer-modal-overlay" onClick={() => setSelectedOffer(null)}>
                    <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <div>
                          <div className="modal-top-info">
                              <h3 className="modal-title">{selectedOffer.title}</h3>
                              <span className="offer-company">
                                  {companyNames[selectedOffer.companyId] || `Entreprise #${selectedOffer.companyId}`}
                              </span>
                          </div>
                          <div className="modal-location">
                             <i className="fa-solid fa-location-dot"></i> {companyCities[selectedOffer.companyId] || 'Non renseigné'}
                          </div>
                        </div>
                        <div className="modal-actions">
                          <Button size="small" variant="secondary" onClick={() => setSelectedOffer(null)}>
                            Fermer
                          </Button>
                          {user && user.roles.includes(user_roles.STUDENT) ? (
                            <>
                              {studentApplications.find(app => app.offerId === selectedOffer.id) ? (
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
                          <strong>{selectedOffer.limitApplicationDate ? formatDate(selectedOffer.limitApplicationDate) : 'Sans limite'}</strong>
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
                              <span key={tag} className="tag">{tag}</span>
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
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default OffersPage;
