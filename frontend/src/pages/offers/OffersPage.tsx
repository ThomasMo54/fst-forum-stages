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
import OffersMap from './OffersMap';

const formatDate = (date?: string | null) => {
  if (!date) return 'Non renseignée';
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('fr-FR');
};

type ViewMode = 'list' | 'map';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [companyCities, setCompanyCities] = useState<Record<string, string>>({});
  const [companyAddresses, setCompanyAddresses] = useState<Record<string, string>>({});
  const [companyPostalCodes, setCompanyPostalCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);
  const [studentApplications, setStudentApplications] = useState<ApplicationDto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchOffersAndApplications();
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
      const addresses: Record<string, string> = {};
      const postalCodes: Record<string, string> = {};

      await Promise.all(companyIds.map(async id => {
        try {
          const company = await CompanyService.getCompanyById(id);
          names[id] = company.name;
          cities[id] = company.city || 'Non renseigné';
          addresses[id] = company.streetAddress || '';
          postalCodes[id] = company.postalCode || '';
        } catch (e) {
          console.error(`Could not fetch company name for ID ${id}`, e);
          names[id] = `Entreprise #${id}`;
          cities[id] = 'Non renseigné';
        }
      }));

      setCompanyNames(names);
      setCompanyCities(cities);
      setCompanyAddresses(addresses);
      setCompanyPostalCodes(postalCodes);

      if(user){
        const applications = await ApplicationService.getAllApplicationForStudent(user.entityId);
        setStudentApplications(applications);
      }
    } catch (err) {
      setListError("Impossible de récupérer les offres pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = useMemo(() => {
    if (!searchTerm.trim()) return offers;
    const term = searchTerm.toLowerCase();
    return offers.filter((offer) => {
      const hasTextMatch =
          offer.title.toLowerCase().includes(term) ||
          offer.description.toLowerCase().includes(term) ||
          (companyNames[offer.companyId] || '').toLowerCase().includes(term);
      const hasTagMatch = (offer.tags ?? []).some((tag) =>
          tag.toLowerCase().includes(term)
      );
      return hasTextMatch || hasTagMatch;
    });
  }, [offers, searchTerm, companyNames]);

  const handleApplyRedirect = (offer: OfferDto) => {
    setSelectedOffer(null);
    navigate(`/offers/${offer.id}/apply`, {
      state: {
        offer,
        companyName: companyNames[offer.companyId] || `Entreprise #${offer.companyId}`
      }
    });
  };

  const handleOfferClick = (offer: OfferDto) => {
    setSelectedOffer(offer);
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

              {/* View Toggle */}
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
                    {/* Map View */}
                    {viewMode === 'map' && (
                        <OffersMap
                            offers={filteredOffers}
                            companyNames={companyNames}
                            companyCities={companyCities}
                            companyAddresses={companyAddresses}
                            companyPostalCodes={companyPostalCodes}
                            onOfferClick={handleOfferClick}
                        />
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
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
                    )}

                    {/* Modal (shared between views) */}
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