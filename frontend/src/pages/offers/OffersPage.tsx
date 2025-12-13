import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import './OffersPage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Button from '../../components/button/Button';
import OfferService, { type CreateOfferDto, type OfferDto } from '../../services/offer.service';
import { useAuth } from '../../context/AuthContext';

const formatDate = (date?: string | null) => {
  if (!date) return 'Non renseignée';
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('fr-FR');
};

const getStoredCompanyId = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('companyId') || '';
};

const buildInitialFormState = (): CreateOfferDto => ({
  title: '',
  description: '',
  companyId: getStoredCompanyId(),
  tags: [],
  salary: '',
  internshipStartDate: '',
  internshipDuration: '',
  limitApplicationDate: '',
  studyLevel: '',
  remoteWorkPolicy: '',
});

const OffersPage: React.FC = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  const [formData, setFormData] = useState<CreateOfferDto>(buildInitialFormState);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const canPublishOffer = user?.roles?.some((role) =>
    role?.toLowerCase().includes('company') || role?.toLowerCase().includes('admin')
  );

  useEffect(() => {
    void fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    setListError('');
    try {
      const data = await OfferService.getAllOffers();
      setOffers(data);
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
        offer.description.toLowerCase().includes(term);
      const hasTagMatch = (offer.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(term)
      );
      return hasTextMatch || hasTagMatch;
    });
  }, [offers, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'companyId') {
        localStorage.setItem('companyId', value);
      }
      return updated;
    });
    if (formError) setFormError('');
    if (formSuccess) setFormSuccess('');
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...buildInitialFormState(),
      companyId: prev.companyId,
    }));
    setTagsInput('');
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.companyId.trim()) {
      setFormError('Le titre, la description et le numéro de société sont obligatoires.');
      return;
    }

    const payload: CreateOfferDto = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      companyId: formData.companyId.trim(),
    };

    const normalizedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (normalizedTags.length) {
      payload.tags = normalizedTags;
    }
    if (formData.salary?.trim()) {
      payload.salary = formData.salary.trim();
    }
    if (formData.internshipStartDate) {
      payload.internshipStartDate = formData.internshipStartDate;
    }
    if (formData.internshipDuration?.trim()) {
      payload.internshipDuration = formData.internshipDuration.trim();
    }
    if (formData.limitApplicationDate) {
      payload.limitApplicationDate = formData.limitApplicationDate;
    }
    if (formData.studyLevel?.trim()) {
      payload.studyLevel = formData.studyLevel.trim();
    }
    if (formData.remoteWorkPolicy?.trim()) {
      payload.remoteWorkPolicy = formData.remoteWorkPolicy.trim();
    }

    setCreating(true);
    try {
      const createdOffer = await OfferService.createOffer(payload);
      setOffers((prev) => [createdOffer, ...prev]);
      setFormSuccess('Offre publiée avec succès.');
      resetForm();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Impossible de créer l'offre. Vérifiez les informations saisies.";
      setFormError(typeof message === 'string' ? message : "Impossible de créer l'offre.");
    } finally {
      setCreating(false);
    }
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
                Retrouvez les offres validées par l&apos;équipe FST et publiez vos besoins en quelques clics.
              </p>
              <div className="hero-actions">
                <Button to="#new-offer" variant="primary">Publier une offre</Button>
                <Button variant="secondary" onClick={() => void fetchOffers()} className="ghost-btn">
                  Rafraîchir la liste
                </Button>
              </div>
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
                  placeholder="Rechercher une offre ou un tag..."
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
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
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
                        <p className="eyebrow">ID {offer.id}</p>
                        <h3>{offer.title}</h3>
                      </div>
                      <span className="badge">Entreprise #{offer.companyId}</span>
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

          <section id="new-offer" className="offers-form-section">
            <div className="section-header">
              <div>
                <p className="eyebrow">Espace entreprise</p>
                <h2>Publier une nouvelle offre</h2>
                {!canPublishOffer && (
                  <p className="form-hint">
                    Seuls les comptes &quot;Entreprise&quot; ou administrateurs peuvent publier une offre.
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div className="error-message">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="success-message">
                {formSuccess}
              </div>
            )}

            <form className={`offer-form ${!canPublishOffer ? 'form-disabled' : ''}`} onSubmit={handleCreateOffer}>
              <fieldset disabled={!canPublishOffer || creating}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title">Titre *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Titre de l'offre"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyId">Identifiant entreprise *</label>
                    <input
                      type="text"
                      id="companyId"
                      name="companyId"
                      placeholder="ID de l'entreprise"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Décrivez la mission, les attentes et les technologies..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      placeholder="tech, data, marketing..."
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                    <small>Séparez les tags par des virgules.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="salary">Salaire</label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      placeholder="Ex: 900€ / mois"
                      value={formData.salary || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="internshipStartDate">Date de début</label>
                    <input
                      type="date"
                      id="internshipStartDate"
                      name="internshipStartDate"
                      value={formData.internshipStartDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="internshipDuration">Durée</label>
                    <input
                      type="text"
                      id="internshipDuration"
                      name="internshipDuration"
                      placeholder="Ex: 6 mois"
                      value={formData.internshipDuration || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="limitApplicationDate">Date limite</label>
                    <input
                      type="date"
                      id="limitApplicationDate"
                      name="limitApplicationDate"
                      value={formData.limitApplicationDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="studyLevel">Niveau requis</label>
                    <select
                      id="studyLevel"
                      name="studyLevel"
                      value={formData.studyLevel || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez un niveau</option>
                      <option value="BUT">BUT</option>
                      <option value="Licence">Licence</option>
                      <option value="Master">Master</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="remoteWorkPolicy">Télétravail</label>
                    <input
                      type="text"
                      id="remoteWorkPolicy"
                      name="remoteWorkPolicy"
                      placeholder="Ex: 2 jours/semaine"
                      value={formData.remoteWorkPolicy || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    disabled={creating}
                    size="small"
                  >
                    Réinitialiser
                  </Button>
                  <Button type="submit" variant="primary" disabled={creating}>
                    {creating ? 'Publication...' : 'Publier l\'offre'}
                  </Button>
                </div>
              </fieldset>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OffersPage;
