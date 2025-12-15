import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import './OffersPage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Button from '../../components/button/Button';
import OfferService, { type OfferDto } from '../../services/offer.service';
import CompanyService from '../../services/company.service';

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

  useEffect(() => {
    void fetchOffers();
  }, []);

  const fetchOffers = async () => {
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
                <Button size="small" variant="secondary" onClick={() => void fetchOffers()}>
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
              <div className="offers-grid">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="offer-card skeleton">
                    <div className="skeleton-line short"/>
                    <div className="skeleton-line"/>
                    <div className="skeleton-line"/>
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
              <div className="offers-grid">
                {filteredOffers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="offer-card-header">
                      <div>
                        <h3>{offer.title}</h3>
                      </div>
                      <span className="badge">{companyNames[offer.companyId] || `Entreprise #${offer.companyId}`}</span>
                    </div>

                    <p className="offer-description">
                      {offer.description}
                    </p>

                    <div className="offer-meta">
                      <div className="meta-item">
                        <span>Début</span>
                        <strong>{formatDate(offer.internshipStartDate)}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Durée</span>
                        <strong>{offer.internshipDuration || 'Non renseignée'}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Candidature</span>
                        <strong>{offer.limitApplicationDate ? formatDate(offer.limitApplicationDate) : 'Sans limite'}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Salaire</span>
                        <strong>{offer.salary || 'Non renseigné'}</strong>
                      </div>
                    </div>

                    <div className="offer-meta secondary">
                      <div className="meta-item">
                        <span>Niveau requis</span>
                        <strong>{offer.studyLevel || 'Ouvert'}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Télétravail</span>
                        <strong>{offer.remoteWorkPolicy || 'À définir'}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Créée le</span>
                        <strong>{formatDate(offer.creationDate)}</strong>
                      </div>
                    </div>

                    {(offer.tags ?? []).length > 0 && (
                      <div className="tags">
                        {(offer.tags ?? []).map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default OffersPage;
