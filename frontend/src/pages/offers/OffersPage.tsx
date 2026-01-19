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
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
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
      await Promise.all(companyIds.map(async id => {
        try {
          const company = await CompanyService.getCompanyById(id);
          names[id] = company.name;
        } catch (e) {
          console.error(`Could not fetch company name for ID ${id}`, e);
          names[id] = `Entreprise #${id}`;
        }
      }));
      setCompanyNames(names);
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

            {listError && (
              <div className="error-message inline-error">
                {listError}
              </div>
            )}

            {loading ? (
              <div className="table-wrapper">
                <table className="offers-table loading">
                  <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Entreprise</th>
                    <th>Tags</th>
                    <th>Début</th>
                    <th>Durée</th>
                    <th>Salaire</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {[1, 2, 3].map((item) => (
                    <tr key={item}>
                      <td><div className="skeleton-line short"/></td>
                      <td><div className="skeleton-line"/></td>
                      <td><div className="skeleton-line"/></td>
                      <td><div className="skeleton-line short"/></td>
                      <td><div className="skeleton-line short"/></td>
                      <td><div className="skeleton-line short"/></td>
                      <td><div className="skeleton-line short"/></td>
                    </tr>
                  ))}
                  </tbody>
                </table>
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
                <div className="table-wrapper">
                  <table className="offers-table">
                    <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Entreprise</th>
                      <th>Tags</th>
                      <th>Début</th>
                      <th>Durée</th>
                      <th>Salaire</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id}>
                        <td>
                          <div className="table-title">{offer.title}</div>
                        </td>
                        <td>{companyNames[offer.companyId] || `Entreprise #${offer.companyId}`}</td>
                        <td>
                          <div className="table-tags">
                            {(offer.tags ?? []).length === 0 ? (
                              <span className="tag muted">Aucun</span>
                            ) : (
                              (offer.tags ?? []).slice(0, 3).map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                              ))
                            )}
                            {(offer.tags ?? []).length > 3 && (
                              <span className="tag more">+{(offer.tags ?? []).length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(offer.internshipStartDate)}</td>
                        <td>{offer.internshipDuration || 'Non renseignée'}</td>
                        <td>{offer.salary || 'Non renseigné'}</td>
                        <td className="table-actions">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            Voir le détail
                          </Button>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {selectedOffer && (
                  <div className="offer-modal-overlay" onClick={() => setSelectedOffer(null)}>
                    <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <div>
                          <p className="eyebrow">Offre {selectedOffer.id}</p>
                          <h3>{selectedOffer.title}</h3>
                          <p className="detail-company">{companyNames[selectedOffer.companyId] || `Entreprise #${selectedOffer.companyId}`}</p>
                        </div>
                        <div className="modal-actions">
                          <Button size="small" variant="secondary" onClick={() => setSelectedOffer(null)}>
                            Fermer
                          </Button>
                          {user && user.roles.includes(user_roles.STUDENT) ? (
                            <>
                              {studentApplications.find(app => app.offerId === selectedOffer.id) ? (
                                <span className="applied-badge">Candidature envoyée</span>
                              ) : (
                                <Button size="small" onClick={() => handleApplyRedirect(selectedOffer)}>
                                  Je postule
                                </Button>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <p className="offer-description">{selectedOffer.description}</p>

                      <div className="offer-meta">
                        <div className="meta-item">
                          <span>Début</span>
                          <strong>{formatDate(selectedOffer.internshipStartDate)}</strong>
                        </div>
                        <div className="meta-item">
                          <span>Durée</span>
                          <strong>{selectedOffer.internshipDuration || 'Non renseignée'}</strong>
                        </div>
                        <div className="meta-item">
                          <span>Limite</span>
                          <strong>{selectedOffer.limitApplicationDate ? formatDate(selectedOffer.limitApplicationDate) : 'Sans limite'}</strong>
                        </div>
                        <div className="meta-item">
                          <span>Salaire</span>
                          <strong>{selectedOffer.salary || 'Non renseigné'}</strong>
                        </div>
                      </div>

                      <div className="offer-meta secondary">
                        <div className="meta-item">
                          <span>Niveau</span>
                          <strong>{selectedOffer.studyLevel || 'Ouvert'}</strong>
                        </div>
                        <div className="meta-item">
                          <span>Télétravail</span>
                          <strong>{selectedOffer.remoteWorkPolicy || 'À définir'}</strong>
                        </div>
                        <div className="meta-item">
                          <span>Créée le</span>
                          <strong>{formatDate(selectedOffer.creationDate)}</strong>
                        </div>
                      </div>

                      {(selectedOffer.tags ?? []).length > 0 && (
                        <div className="tags">
                          {(selectedOffer.tags ?? []).map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
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
