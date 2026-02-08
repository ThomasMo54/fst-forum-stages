import React, { useEffect, useState } from 'react';
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

const ApplicationPage: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferDto | null>(null);
  const [applications, setApplications] = useState<ApplicationWithStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<boolean>(false);

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

        // Fetch student details for each application
        const applicationsWithStudents = await Promise.all(
          applicationsData.map(async (application) => {
            try {
              const student = await StudentService.getStudentById(application.studentId);
              return { ...application, student };
            } catch (err) {
              console.error(`Error fetching student ${application.studentId}:`, err);
              return application;
            }
          })
        );

        setApplications(applicationsWithStudents);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Erreur lors du chargement des candidatures. Veuillez réessayer.");
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
              <span><strong>Nombre de candidatures:</strong> {applications.length}</span>
            </div>
          </div>
          <div className="offer-actions">
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

        {applications.length === 0 ? (
          <div className="no-applications-container">
            <i className="fas fa-inbox"></i>
            <p className="no-applications-message">Aucune candidature pour cette offre pour le moment.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className="application-card">
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
