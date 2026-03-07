import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Button from "../../components/button/Button";
import './ApplicationPage.css';
import ApplicationService, { type ApplicationDto } from "../../services/application.service.ts";
import OfferService, { type OfferDto } from "../../services/offer.service.ts";
import StudentService, { type StudentDto } from "../../services/student.service.ts";

interface ApplicationWithStudent extends ApplicationDto {
  student?: StudentDto;
}

interface ApplicationFilters {
  educationLevel: string;
  specialization: string;
  status: string; // 'all' | 'accepted' | 'rejected' | 'pending'
  // Filtre par date
  dateSort: string; // 'none' | 'newest' | 'oldest'
  dateStart: string; // Date de début pour "entre deux dates"
  dateEnd: string; // Date de fin pour "entre deux dates"
  // Filtre par compétences/technologies
  skills: string; // Recherche par compétences
  // Filtre par disponibilité
  availabilityStart: string; // Disponible à partir de...
  availableImmediately: boolean; // Disponible immédiatement
  minDuration: string; // Durée minimum
}

const ApplicationPage: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferDto | null>(null);
  const [applications, setApplications] = useState<ApplicationWithStudent[]>([]);
  const [allApplications, setAllApplications] = useState<ApplicationWithStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<boolean>(false);
  const [processingApplications, setProcessingApplications] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<ApplicationFilters>({
    educationLevel: '',
    specialization: '',
    status: 'all',
    dateSort: 'none',
    dateStart: '',
    dateEnd: '',
    skills: '',
    availabilityStart: '',
    availableImmediately: false,
    minDuration: ''
  });

  const isOfferClosed = (currentOffer: OfferDto | null) => {
    if (!currentOffer) return false;
    return currentOffer.offerOpen === false;
  };

  useEffect(() => {
    const fetchApplicationsAndOffer = async () => {
      if (!offerId) {
        setError("ID de l'offre manquant.");
        setLoading(false);
        return;
      }

      try {
        // Fetch offer details
        const offerData = await OfferService.getOfferById(offerId);
        setOffer(offerData);

        // Fetch all applications for this offer
        const applicationsData = await ApplicationService.getAllApplicationsForOffer(offerId);
        console.log(`Loaded ${applicationsData.length} applications for offer ${offerId}`);

        // Filtrer les applications avec des studentId valides
        const validApplications = applicationsData.filter(app => {
          const isValid = app.studentId &&
                          app.studentId !== 'null' &&
                          app.studentId !== ':1' &&
                          app.studentId.trim() !== '';
          if (!isValid) {
            console.warn(`Skipping application ${app.id} with invalid studentId: ${app.studentId}`);
          }
          return isValid;
        });

        console.log(`${validApplications.length} applications with valid studentId`);

        // Fetch student details for each valid application
        const applicationsWithStudents = await Promise.all(
          validApplications.map(async (application) => {
            try {
              const student = await StudentService.getStudentById(application.studentId);
              return { ...application, student };
            } catch (err: any) {
              console.error(`Error fetching student ${application.studentId} for application ${application.id}:`, err?.response?.status, err?.message);
              // Retourner l'application sans les données de l'étudiant plutôt que de bloquer
              return { ...application, student: undefined };
            }
          })
        );

        const applicationsWithStudentData = applicationsWithStudents.filter(app => app.student);
        console.log(`Successfully loaded ${applicationsWithStudentData.length} applications with student data`);

        if (applicationsWithStudentData.length === 0 && applicationsData.length > 0) {
          console.warn(`No applications with valid student data found. Total applications: ${applicationsData.length}`);
          setError("Aucune candidature avec des données étudiant valides trouvée. Vérifiez que les candidatures ont des étudiants associés.");
        }

        setAllApplications(applicationsWithStudents);
        setApplications(applicationsWithStudents);
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Erreur lors du chargement des candidatures. Veuillez réessayer.";
        setError(errorMessage);
        console.error("Error details:", {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationsAndOffer();
  }, [offerId]);

  const handleViewResume = async (studentId: string) => {
    try {
      const resumeUrl = await StudentService.getResumeUrl(studentId);
      window.open(resumeUrl, '_blank');
    } catch (err) {
      console.error("Error fetching resume:", err);
      alert("Erreur lors de la récupération du CV.");
    }
  };

  const handleViewCoverLetter = async (applicationId: string) => {
    try {
      const coverLetterUrl = await ApplicationService.getCoverLetterUrl(applicationId);
      window.open(coverLetterUrl, '_blank');
      
    } catch (err) {
      console.error("Error fetching cover letter:", err);
      alert("Erreur lors de la récupération de la lettre de motivation.");
    }
  };

  const handleApplicationStatusChange = async (applicationId: string, action: 'accept' | 'reject' | 'reset') => {
    setProcessingApplications(prev => new Set([...prev, applicationId]));
    try {
      let updatedApplication: ApplicationDto;
      const currentApp = applications.find(app => app.id === applicationId);
      const currentStatus = getApplicationStatus(currentApp!);

      // If trying to accept but rejected, or reject but accepted, reset first
      if ((action === 'accept' && currentStatus === 'rejected') || (action === 'reject' && currentStatus === 'accepted')) {
        await ApplicationService.resetApplicationStatus(applicationId);
      }

      // Now perform the desired action
      if (action === 'accept') {
        updatedApplication = await ApplicationService.acceptApplication(applicationId);
      } else if (action === 'reject') {
        updatedApplication = await ApplicationService.rejectApplication(applicationId);
      } else {
        updatedApplication = await ApplicationService.resetApplicationStatus(applicationId);
      }

      // Update the applications list with the new status
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, ...updatedApplication } : app)
      );
    } catch (err) {
      console.error(`Error ${action}ing application:`, err);
      alert(`Erreur lors de la ${action === 'accept' ? 'validation' : action === 'reject' ? 'rejection' : 'réinitialisation'} de la candidature.`);
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const getApplicationStatus = useCallback((app: ApplicationWithStudent) => {
    if (app.accepted) return 'accepted';
    if (app.rejected) return 'rejected';
    return 'pending';
  }, []);

  // Fonction de filtrage des candidatures
  const filteredApplications = useMemo(() => {
    return allApplications.filter(app => {
      // Si on filtre par diplôme/spécialité et que l'étudiant n'est pas chargé, exclure la candidature
      if ((filters.educationLevel && filters.educationLevel.trim()) ||
          (filters.specialization && filters.specialization.trim())) {
        if (!app.student) {
          return false;
        }
      }

      // Filtrer par diplôme
      if (filters.educationLevel && filters.educationLevel.trim()) {
        const searchTerms = filters.educationLevel.toLowerCase().trim().split(/\s+/);
        const educationLevel = app.student?.educationLevel?.toLowerCase() || '';
        const specialization = app.student?.specialization?.toLowerCase() || '';
        const fieldOfStudy = app.student?.fieldOfStudy?.toLowerCase() || '';

        // Combiner tous les champs pour la recherche
        const combinedText = `${educationLevel} ${specialization} ${fieldOfStudy}`.trim();

        // Si le texte combiné est vide, exclure la candidature
        if (!combinedText) {
          return false;
        }

        // Vérifier si tous les termes correspondent dans n'importe quel champ
        const matchesEducation = searchTerms.every(term =>
          combinedText.includes(term)
        );

        if (!matchesEducation) {
          return false;
        }
      }

      // Filtrer par spécialité
      if (filters.specialization && filters.specialization.trim()) {
        const searchTerms = filters.specialization.toLowerCase().trim().split(/\s+/);
        const specialization = app.student?.specialization?.toLowerCase() || '';
        const fieldOfStudy = app.student?.fieldOfStudy?.toLowerCase() || '';

        // Combiner les champs pour la recherche
        const combinedText = `${specialization} ${fieldOfStudy}`.trim();

        // Si le texte combiné est vide, exclure la candidature
        if (!combinedText) {
          return false;
        }

        // Vérifier si tous les termes correspondent
        const matchesSpecialization = searchTerms.every(term =>
          combinedText.includes(term)
        );

        if (!matchesSpecialization) {
          return false;
        }
      }

      // Filtrer par statut de candidature
      if (filters.status !== 'all') {
        const appStatus = getApplicationStatus(app);
        if (appStatus !== filters.status) {
          return false;
        }
      }

      // Filtrer par compétences/technologies
      if (filters.skills && filters.skills.trim() && app.student?.skills && app.student.skills.length > 0) {
        const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
        const studentSkills = app.student.skills.map(s => s.toLowerCase());
        const hasMatchingSkill = searchSkills.some(searchSkill =>
          studentSkills.some(skill => skill.includes(searchSkill))
        );
        if (!hasMatchingSkill) {
          return false;
        }
      }

      // Note: Les filtres de date et disponibilité nécessitent des données supplémentaires
      // qui ne sont pas disponibles dans le DTO actuel sans modification backend

      return true;
    });
  }, [allApplications, filters, getApplicationStatus]);

  // Trier par date si demandé (nécessite createdAt dans le DTO)
  const sortedAndFilteredApplications = useMemo(() => {
    let sorted = [...filteredApplications];

    // Note: Le tri par date nécessite createdAt dans ApplicationDto
    // Pour l'instant, on ne peut trier que par les données disponibles
    if (filters.dateSort === 'newest') {
      // Tri par date de création (nécessite createdAt)
      // sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.dateSort === 'oldest') {
      // Tri par date de création (nécessite createdAt)
      // sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return sorted;
  }, [filteredApplications, filters.dateSort]);

  // Mettre à jour les candidatures affichées quand les filtres changent
  useEffect(() => {
    setApplications(sortedAndFilteredApplications);
  }, [sortedAndFilteredApplications]);

  // Compter le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.educationLevel) count++;
    if (filters.specialization) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateSort !== 'none') count++;
    if (filters.dateStart || filters.dateEnd) count++;
    if (filters.skills) count++;
    if (filters.availabilityStart) count++;
    if (filters.availableImmediately) count++;
    if (filters.minDuration) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof ApplicationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      educationLevel: '',
      specialization: '',
      status: 'all',
      dateSort: 'none',
      dateStart: '',
      dateEnd: '',
      skills: '',
      availabilityStart: '',
      availableImmediately: false,
      minDuration: ''
    });
  };

  const handleChangeOfferStatus = async () => {
    if (!offerId) {
      setError("ID de l'offre manquant.");
      return;
    }

    const confirmMessage = isOfferClosed(offer)
      ? "Êtes-vous sûr de vouloir rouvrir cette offre ? Les candidatures seront à nouveau acceptées."
      : "Êtes-vous sûr de vouloir clôturer cette offre ? Les candidatures ne seront plus acceptées mais vous pourrez toujours consulter les candidatures déjà reçues.";
    const confirmClose = window.confirm(confirmMessage);
    if (!confirmClose) return;

    try {
      setClosing(true);
      const updatedOffer = await OfferService.changeOfferStatus(offerId);
      console.log("Offer status updated:", updatedOffer);
      setOffer(updatedOffer);
    } catch (err) {
      console.error("Error closing offer:", err);
      setError("Erreur lors de la clôture de l'offre. Veuillez réessayer.");
    } finally {
      setClosing(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p>Chargement des candidatures...</p>;
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    if (!offer) {
      return <p className="error-message">Offre introuvable.</p>;
    }

    return (
      <>
        <div className="applications-header">
          <Button variant="icon" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </Button>
          <div className="offer-info">
            <h1>Candidatures pour: {offer.title}</h1>
            <p className="offer-description">{offer.description}</p>
            <div className="offer-details">
              <span><strong>Date de création:</strong> {new Date(offer.creationDate).toLocaleDateString()}</span>
              <span><strong>Date limite:</strong> {new Date(offer.limitApplicationDate).toLocaleDateString()}</span>
              <span><strong>Nombre de candidatures:</strong> {applications.length} {allApplications.length !== applications.length && `(${allApplications.length} au total)`}</span>
            </div>
          </div>
          <div className="offer-actions">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-button ${showFilters ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
            >
              <i className={`fas ${showFilters ? 'fa-times' : 'fa-filter'}`}></i>
              {showFilters ? 'Masquer les filtres' : 'Filtrer les candidatures'}
              {activeFiltersCount > 0 && (
                <span className="filter-badge">{activeFiltersCount}</span>
              )}
            </Button>
            <span className={`offer-status-text ${isOfferClosed(offer) ? 'closed' : 'open'}`}>
              {isOfferClosed(offer) ? "Offre clôturée" : "Offre ouverte"}
            </span>
            <Button
              variant={isOfferClosed(offer) ? "success" : "danger"}
              onClick={handleChangeOfferStatus}
              disabled={closing}
            >
              <i className={`fas ${isOfferClosed(offer) ? 'fa-unlock' : 'fa-lock'}`}></i>
              {closing
                ? 'Mise à jour...'
                : isOfferClosed(offer)
                ? "Rouvrir l'offre"
                : "Clôturer l'offre"}
            </Button>
          </div>
        </div>

        {/* Interface de filtrage */}
        {showFilters && (
          <div className="filters-panel">
            <h3><i className="fas fa-filter"></i> Filtres de candidatures</h3>
            <div className="filters-grid filters-single-line">
              <div className="filter-group">
                <label htmlFor="filter-education">
                  <i className="fas fa-graduation-cap"></i> Diplôme
                </label>
                <input
                  id="filter-education"
                  type="text"
                  placeholder="Ex: Bac +5, Master..."
                  value={filters.educationLevel}
                  onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filter-specialization">
                  <i className="fas fa-award"></i> Spécialité
                </label>
                <input
                  id="filter-specialization"
                  type="text"
                  placeholder="Ex: Informatique, Marketing..."
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange('specialization', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filter-status">
                  <i className="fas fa-check-circle"></i> Statut
                </label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptées</option>
                  <option value="rejected">Rejetées</option>
                </select>
              </div>

              {/* Bouton Plus */}
              <div className="filter-group filter-more-button">
                <Button
                  variant="secondary"
                  onClick={() => setShowAdvancedFilters(true)}
                  className="filter-more-btn"
                >
                  <i className="fas fa-plus"></i>
                  Plus
                </Button>
              </div>
            </div>
            <div className="filters-actions">
              <Button variant="primary" onClick={() => {}}>
                <i className="fas fa-check"></i> Appliquer
              </Button>
              <Button variant="secondary" onClick={resetFilters}>
                <i className="fas fa-redo"></i> Réinitialiser
              </Button>
            </div>
          </div>
        )}

        {/* les filtres avancés */}
        {showAdvancedFilters && (
          <div className="filter-modal-overlay" onClick={() => setShowAdvancedFilters(false)}>
            <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="filter-modal-header">
                <h3><i className="fas fa-filter"></i> Filtres avancés</h3>
                <button
                  className="filter-modal-close"
                  onClick={() => setShowAdvancedFilters(false)}
                  aria-label="Fermer"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="filter-modal-body">
                <div className="filters-grid-modal">
                  <div className="filter-group">
                    <label htmlFor="filter-date-sort-modal">
                      <i className="fas fa-sort"></i> Trier par date
                    </label>
                    <select
                      id="filter-date-sort-modal"
                      value={filters.dateSort}
                      onChange={(e) => handleFilterChange('dateSort', e.target.value)}
                    >
                      <option value="none">Aucun</option>
                      <option value="newest">Plus récentes</option>
                      <option value="oldest">Plus anciennes</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-date-start-modal">
                      <i className="fas fa-calendar"></i> Date début
                    </label>
                    <input
                      id="filter-date-start-modal"
                      type="date"
                      value={filters.dateStart}
                      onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-date-end-modal">
                      <i className="fas fa-calendar"></i> Date fin
                    </label>
                    <input
                      id="filter-date-end-modal"
                      type="date"
                      value={filters.dateEnd}
                      onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                    />
                  </div>
                  <div className="filter-group filter-group-full">
                    <label htmlFor="filter-skills-modal">
                      <i className="fas fa-code"></i> Technologies
                    </label>
                    <input
                      id="filter-skills-modal"
                      type="text"
                      placeholder="Java, React, Python..."
                      value={filters.skills}
                      onChange={(e) => handleFilterChange('skills', e.target.value)}
                    />
                    <small className="filter-hint">Séparez les technologies par des virgules</small>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-availability-start-modal">
                      <i className="fas fa-calendar-check"></i> Disponible à partir de
                    </label>
                    <input
                      id="filter-availability-start-modal"
                      type="date"
                      value={filters.availabilityStart}
                      onChange={(e) => handleFilterChange('availabilityStart', e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-available-immediately-modal" className="checkbox-label">
                      <input
                        id="filter-available-immediately-modal"
                        type="checkbox"
                        checked={filters.availableImmediately}
                        onChange={(e) => setFilters(prev => ({ ...prev, availableImmediately: e.target.checked }))}
                      />
                      <span><i className="fas fa-bolt"></i> Disponible immédiatement</span>
                    </label>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-min-duration-modal">
                      <i className="fas fa-hourglass-half"></i> Durée minimum
                    </label>
                    <input
                      id="filter-min-duration-modal"
                      type="text"
                      placeholder="Ex: 3 mois, 6 mois..."
                      value={filters.minDuration}
                      onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="filter-modal-footer">
                <Button variant="secondary" onClick={() => setShowAdvancedFilters(false)}>
                  <i className="fas fa-check"></i> Appliquer
                </Button>
                <Button variant="secondary" onClick={resetFilters}>
                  <i className="fas fa-redo"></i> Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="no-applications-container">
            <i className="fas fa-inbox"></i>
            <p className="no-applications-message">Aucune candidature pour cette offre pour le moment.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className={`application-card ${getApplicationStatus(application)}`}>
                {application.student ? (
                  <>
                    <div className="application-header">
                      <div className="student-info">
                        <h2>{application.student.firstName} {application.student.lastName}</h2>
                        <p className="student-number">Numéro étudiant: {application.student.studentNumber}</p>
                      </div>
                      <div className="application-actions">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleViewResume(application.student!.id)}
                        >
                          <i className="fas fa-file-pdf"></i> Voir CV
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleViewCoverLetter(application.id)}
                        >
                          <i className="fas fa-envelope"></i> Lettre de motivation
                        </Button>
                      </div>
                    </div>
                    <div className="application-body">
                      <div className="info-row">
                        <div className="info-item">
                          <i className="fas fa-envelope"></i>
                          <span>{application.student.email}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-phone"></i>
                          <span>{application.student.phone || 'Non renseigné'}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-item">
                          <i className="fas fa-graduation-cap"></i>
                          <span>{application.student.educationLevel}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-book"></i>
                          <span>Année {application.student.yearOfStudy}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-item">
                          <i className="fas fa-microscope"></i>
                          <span>{application.student.fieldOfStudy}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-award"></i>
                          <span>{application.student.specialization || 'Non spécifié'}</span>
                        </div>
                      </div>
                      {application.student.skills && application.student.skills.length > 0 && (
                        <div className="skills-section">
                          <strong><i className="fas fa-tools"></i> Compétences:</strong>
                          <div className="skills-tags">
                            {application.student.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="application-status-actions">
                      <Button
                        variant={getApplicationStatus(application) === 'accepted' ? 'success' : 'secondary'}
                        onClick={() => getApplicationStatus(application) === 'accepted' ? handleApplicationStatusChange(application.id, 'reset') : handleApplicationStatusChange(application.id, 'accept')}
                        disabled={processingApplications.has(application.id)}
                        className="status-button accept-button"
                      >
                        <i className={`fas ${getApplicationStatus(application) === 'accepted' ? 'fa-check-circle' : 'fa-check'}`}></i>
                      </Button>
                      <Button
                        variant={getApplicationStatus(application) === 'rejected' ? 'danger' : 'secondary'}
                        onClick={() => getApplicationStatus(application) === 'rejected' ? handleApplicationStatusChange(application.id, 'reset') : handleApplicationStatusChange(application.id, 'reject')}
                        disabled={processingApplications.has(application.id)}
                        className="status-button reject-button"
                      >
                        <i className={`fas ${getApplicationStatus(application) === 'rejected' ? 'fa-times-circle' : 'fa-times'}`}></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="application-loading">
                    <p>Chargement des informations de l'étudiant...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="application-page">
      <Header />
      <main className="application-container">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationPage;
