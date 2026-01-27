import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../styles/global.css';
import './ApplyOfferPage.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Button from '../../components/button/Button';
import OfferService, { type OfferDto } from '../../services/offer.service';
import CompanyService from '../../services/company.service';
import { useAuth } from '../../context/AuthContext';
import ApplicationService, { type ApplicationDto } from '../../services/application.service';

const formatDate = (date?: string | null) => {
  if (!date) return 'Non renseignée';
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('fr-FR');
};

type LocationState = {
  offer?: OfferDto;
  companyName?: string;
};

interface ApplicationForm {
  // fullName: string;
  // email: string;
  // phone: string;
  // cvLink: string;
  // cvFileName?: string;
  coverLetterLink: string;
  coverLetterFileName?: string;
  coverLetterFile?: File;
  // coverLetter: string;
  // availability: string;
  // portfolio: string;
}

const ApplyOfferPage: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationState = (location.state as LocationState) || {};

  const [offer, setOffer] = useState<OfferDto | null>(locationState.offer ?? null);
  const [companyName, setCompanyName] = useState<string>(locationState.companyName ?? '');
  const [loadingOffer, setLoadingOffer] = useState<boolean>(!locationState.offer);
  const [applicationError, setApplicationError] = useState<string>('');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<Partial<ApplicationForm>>({});
  const [formData, setFormData] = useState<ApplicationForm>({
    // fullName: '',
    // email: '',
    // phone: '',
    // cvLink: '',
    coverLetterLink: '',
    coverLetterFileName: '',
    // availability: '',
    // portfolio: ''
  });

  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId || offer) return;

      setLoadingOffer(true);
      setApplicationError('');
      try {
        const fetchedOffer = await OfferService.getOfferById(offerId);
        setOffer(fetchedOffer);
      } catch (e) {
        setApplicationError("Impossible de charger cette offre pour le moment.");
      } finally {
        setLoadingOffer(false);
      }
    };

    void fetchOffer();
  }, [offerId, offer]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!offer || companyName) return;
      try {
        const company = await CompanyService.getCompanyById(offer.companyId);
        setCompanyName(company.name);
      } catch (e) {
        setCompanyName(`Entreprise #${offer.companyId}`);
      }
    };

    void fetchCompanyName();
  }, [offer, companyName]);

  // useEffect(() => {
  //   const fetchStudentData = async () => {
  //     if (!user) return;
  //     try {
  //       const student: StudentDto = await StudentService.getStudentById(user.entityId);
  //       setFormData((prev) => ({
  //         ...prev,
  //         fullName: `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim(),
  //         email: student.email ?? '',
  //         phone: student.phone ?? '',
  //         cvLink: student.cvPath ?? ''
  //       }));
  //     } catch (e) {
  //       setPrefillError("Vos informations étudiant n'ont pas pu être chargées automatiquement.");
  //     }
  //   };

  //   void fetchStudentData();
  // }, [user]);

  // useEffect(() => {
  //   if (offer?.internshipStartDate && !formData.availability) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       availability: `Disponible dès le ${formatDate(offer.internshipStartDate)}`
  //     }));
  //   }
  // }, [offer, formData.availability]);

  const topTags = useMemo(() => {
    if (!offer?.tags || offer.tags.length === 0) return [];
    return offer.tags.slice(0, 4);
  }, [offer]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  // const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const result = typeof reader.result === 'string' ? reader.result : '';
  //     setFormData((prev) => ({
  //       ...prev,
  //       cvLink: result,
  //       cvFileName: file.name
  //     }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      coverLetterFileName: file.name,
      coverLetterFile: file
    }));
  }

  const validate = (): boolean => {
    const errors: Partial<ApplicationForm> = {};
    // if (!formData.fullName.trim()) errors.fullName = 'Votre nom complet est requis.';
    // if (!formData.email.trim()) {
    //   errors.email = 'Votre email est requis.';
    // } else {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(formData.email.trim())) {
    //     errors.email = "L'email n'est pas valide.";
    //   }
    // }
    // if (!formData.coverLetter.trim()) errors.coverLetter = 'Un message de motivation est requis.';
    // if (formData.coverLetter && formData.coverLetter.trim().length < 30) {
    //   errors.coverLetter = 'Ajoutez quelques détails sur votre profil (30 caractères min).';
    // }
    if (!formData.coverLetterFile || !formData.coverLetterFileName) {
      errors.coverLetterLink = 'Une lettre de motivation est requise.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerId) {
      setApplicationError("Identifiant de l'offre manquant.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setApplicationError('');
    setSubmitMessage('');

    // const application: ApplyOfferDto = {
    //   fullName: formData.fullName.trim(),
    //   email: formData.email.trim(),
    //   phone: formData.phone.trim() || undefined,
    //   cvLink: formData.cvLink.trim() || undefined,
    //   coverLetter: formData.coverLetter.trim(),
    //   availability: formData.availability.trim() || undefined,
    //   portfolio: formData.portfolio.trim() || undefined
    // };

    try {
      const result: ApplicationDto = await ApplicationService.createApplication({
          studentId: user?.entityId || '',
          offerId: offerId
        }
      );

      const uploadLink = await ApplicationService.uploadCoverLetter(result.id);

      if (formData.coverLetterFile) {
        await fetch(uploadLink, {
          method: 'PUT',
          body: formData.coverLetterFile,
          headers: {
            'Content-Type': formData.coverLetterFile.type || 'application/pdf',
          },
        });
      }
      
      setSubmitMessage('Votre candidature a bien été envoyée. Notre équipe et l’entreprise seront notifiées.');

      // Rafraîchir la page après 1.5 secondes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      setApplicationError("Impossible d'envoyer votre candidature pour le moment. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper apply-page">
      <Header />
      <main className="apply-main">
        <div className="container">
          <section className="apply-hero">
            <div>
              <p className="eyebrow">Candidature</p>
              <h1>Postuler à {offer ? offer.title : 'cette offre'}</h1>
              <p className="lead">
                Un format clair inspiré de Hellowork pour déposer votre candidature en quelques clics.
              </p>
              <div className="apply-hero-meta">
                {companyName && <span className="pill">{companyName}</span>}
                {offer?.remoteWorkPolicy && <span className="pill ghost">{offer.remoteWorkPolicy}</span>}
                {offer?.internshipDuration && <span className="pill ghost">{offer.internshipDuration}</span>}
              </div>
            </div>
            <div className="hero-highlight">
              <p className="mini-label">En bref</p>
              <h3>{offer ? offer.title : 'Offre en cours de chargement'}</h3>
              <ul>
                <li><strong>Début :</strong> {formatDate(offer?.internshipStartDate)}</li>
                <li><strong>Durée :</strong> {offer?.internshipDuration || 'Non renseignée'}</li>
                <li><strong>Salaire :</strong> {offer?.salary || 'Non renseigné'}</li>
              </ul>
            </div>
          </section>

          <div className="apply-grid">
            <section className="apply-card">
              <div className="apply-card-header">
                <div>
                  <p className="eyebrow">Votre profil</p>
                  <h2>Déposez votre candidature</h2>
                  <p className="muted">
                    Complétez les informations suivantes. Vous pourrez toujours éditer votre profil étudiant plus tard.
                  </p>
                </div>
                <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
                  Retour aux offres
                </Button>
              </div>

              {applicationError && <div className="info-banner danger">{applicationError}</div>}
              {submitMessage && <div className="info-banner success">{submitMessage}</div>}

              {loadingOffer ? (
                <div className="apply-loader">
                  <div className="loading-bar" />
                  <p>Chargement de l&apos;offre...</p>
                </div>
              ) : (
                <form className="apply-form" onSubmit={handleSubmit}>
                  {/* <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Nom complet *</label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ex : Jeanne Martin"
                        className={formErrors.fullName ? 'input-error' : ''}
                      />
                      {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jeanne.martin@exemple.fr"
                        className={formErrors.email ? 'input-error' : ''}
                      />
                      {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                    </div>
                  </div> */}

                  <div className="form-row">
                    {/* <div className="form-group">
                      <label htmlFor="phone">Téléphone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div> */}
                    {/* <div className="form-group">
                      <label htmlFor="cvLink">CV (import ou lien)</label>
                      <div className="file-input-row">
                        <label className="file-upload">
                          Importer un fichier
                          <input
                            id="cvFile"
                            name="cvFile"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCvFileChange}
                          />
                        </label>
                        <input
                          id="cvLink"
                          name="cvLink"
                          type="text"
                          value={formData.cvLink}
                          onChange={handleChange}
                          placeholder="Ou collez un lien vers votre CV / portfolio"
                        />
                      </div>
                      <p className="muted tiny">
                        {formData.cvFileName ? `Fichier prêt: ${formData.cvFileName}` : 'PDF ou DOC recommandé, 5 Mo max.'}
                      </p>
                    </div> */}
                    <div className="form-group">
                      <label htmlFor="coverLetter">Lettre de motivation *</label>
                      <div className='file-input-row'>
                          <label className="file-upload">
                            Importer un fichier
                            <input
                              id="coverLetterFile"
                              name="coverLetterFile"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleCoverLetterFileChange}
                            />
                          </label>
                      
                      </div>
                      <p className="muted tiny">
                          {formData.coverLetterFileName ? `Fichier prêt: ${formData.coverLetterFileName}` : 'PDF ou DOC recommandé, 5 Mo max.'}
                      </p>
                      {formErrors.coverLetterLink && <p className="error-message">{formErrors.coverLetterLink}</p>}
                      
                      {/* <textarea
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Expliquez pourquoi vous êtes le bon profil pour ce stage (stack, projets, disponibilités...)"
                        className={formErrors.coverLetter ? 'input-error' : ''}
                      />
                      {formErrors.coverLetter && <p className="error-message">{formErrors.coverLetter}</p>} */}
                    </div>
                  </div>

                  

                  {/* <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="availability">Disponibilités</label>
                      <input
                        id="availability"
                        name="availability"
                        type="text"
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="Dès maintenant, dès mars 2026..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="portfolio">Lien supplémentaire</label>
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="text"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="LinkedIn, GitHub, site perso..."
                      />
                    </div>
                  </div> */}

                  <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate('/offers')}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                    </Button>
                  </div>
                </form>
              )}
            </section>

            <aside className="offer-recap">
              <div className="recap-card">
                <p className="mini-label">Offre ciblée</p>
                <h3>{offer?.title || 'Offre non trouvée'}</h3>
                <p className="muted">{companyName || 'Entreprise en cours de chargement'}</p>

                <div className="recap-meta">
                  <div>
                    <span>Début</span>
                    <strong>{formatDate(offer?.internshipStartDate)}</strong>
                  </div>
                  <div>
                    <span>Durée</span>
                    <strong>{offer?.internshipDuration || 'Non renseignée'}</strong>
                  </div>
                  <div>
                    <span>Salaire</span>
                    <strong>{offer?.salary || 'Non renseigné'}</strong>
                  </div>
                  <div>
                    <span>Limite</span>
                    <strong>{offer?.limitApplicationDate ? formatDate(offer.limitApplicationDate) : 'Sans limite'}</strong>
                  </div>
                </div>

                {topTags.length > 0 && (
                  <div className="recap-tags">
                    {topTags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="recap-box">
                  <p className="muted">À savoir</p>
                  <ul className="bullet-list">
                    <li>Votre candidature est transmise directement à l&apos;entreprise.</li>
                    <li>Vous pouvez suivre et mettre à jour vos informations dans votre espace étudiant.</li>
                    <li>Pensez à personnaliser votre message pour maximiser vos chances.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyOfferPage;
