import React, { useState, useEffect } from 'react';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import Button from "../../../components/button/Button";
import './OfferFormPage.css';
import { useAuth } from "../../../context/AuthContext.tsx";
import OfferService, { type CreateOfferDto } from "../../../services/offer.service.ts";
import { useNavigate, useParams } from "react-router-dom";

interface OfferForm {
  title: string;
  description: string;
  tags: string;
  salary: string;
  internshipStartDate: string;
  internshipDuration: string;
  limitApplicationDate: string;
  studyLevel: string;
  remoteWorkPolicy: string;
}

interface OfferFormPageProps {
  mode: 'create' | 'edit';
}

const OfferFormPage: React.FC<OfferFormPageProps> = ({ mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { offerId } = useParams<{ offerId: string }>();

  const [formData, setFormData] = useState<OfferForm>({
    title: '',
    description: '',
    tags: '',
    salary: '',
    internshipStartDate: '',
    internshipDuration: '',
    limitApplicationDate: '',
    studyLevel: '',
    remoteWorkPolicy: ''
  });
  const [errors, setErrors] = useState<Partial<OfferForm>>({});
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(mode === 'edit');

  // Load existing offer data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && offerId) {
      loadOfferData(offerId);
    }
  }, [mode, offerId]);

  const loadOfferData = async (id: string) => {
    try {
      setLoading(true);
      const offer = await OfferService.getOfferById(id);

      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        tags: Array.isArray(offer.tags) ? offer.tags.join(', ') : '',
        salary: offer.salary || '',
        internshipStartDate: offer.internshipStartDate || '',
        internshipDuration: offer.internshipDuration || '',
        limitApplicationDate: offer.limitApplicationDate || '',
        studyLevel: offer.studyLevel || '',
        remoteWorkPolicy: offer.remoteWorkPolicy || ''
      });
    } catch (error) {
      setCreationError("Erreur lors du chargement de l'offre. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<OfferForm> = {};
    if (!formData.title) newErrors.title = "Le titre de l'offre est requis.";
    if (formData.title.length > 100) newErrors.title = "Le titre ne doit pas dépasser 100 caractères.";
    if (!formData.description) newErrors.description = "La description de l'offre est requise.";
    if (!formData.internshipStartDate) newErrors.internshipStartDate = "La date de début du stage est requise.";
    if (!formData.limitApplicationDate) newErrors.limitApplicationDate = "La date limite de candidature est requise.";

    const today = new Date().toISOString().split('T')[0];
    if (formData.internshipStartDate && formData.internshipStartDate < today) {
      newErrors.internshipStartDate = "La date de début du stage ne peut pas être dans le passé.";
    }
    if (formData.limitApplicationDate && formData.limitApplicationDate < today) {
      newErrors.limitApplicationDate = "La date limite de candidature ne peut pas être dans le passé.";
    }
    if (formData.internshipStartDate && formData.limitApplicationDate && formData.limitApplicationDate > formData.internshipStartDate) {
      newErrors.limitApplicationDate = "La date limite de candidature ne peut pas être après la date de début du stage.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setCreationError(null);
    setCreationSuccess(null);
    setSubmitting(true);

    const companyId = user?.entityId;
    if (!companyId) {
      setCreationError("Erreur : L'identifiant de l'entreprise n'a pas pu être récupéré.");
      setSubmitting(false);
      return;
    }

    const offerData: CreateOfferDto = {
      title: formData.title,
      description: formData.description,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      salary: formData.salary,
      internshipStartDate: formData.internshipStartDate,
      internshipDuration: formData.internshipDuration,
      limitApplicationDate: formData.limitApplicationDate,
      studyLevel: formData.studyLevel,
      remoteWorkPolicy: formData.remoteWorkPolicy,
      companyId
    };

    try {
      if (mode === 'edit' && offerId) {
        await OfferService.updateOffer(offerId, offerData);
      } else {
        await OfferService.createOffer(offerData);
      }
      setCreationSuccess("Offre publiee avec succes.");
      navigate('/company/my-offers');
    } catch (error) {
      const errorMessage = mode === 'edit'
        ? "Une erreur est survenue lors de la modification de l'offre. Veuillez réessayer."
        : "Une erreur est survenue lors de la publication de l'offre. Veuillez réessayer.";
      setCreationError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="create-offer-container">
          <p>Chargement...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="create-offer-container">
        <h1 className="create-offer-title">
          {mode === 'edit' ? "Modifier l'offre de stage" : "Créer une offre de stage"}
        </h1>

        <form className="create-offer-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">Titre de l'offre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Développeur Fullstack React/Java"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détaillez les missions, le profil recherché..."
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <p className="error-message">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (séparés par des virgules)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ex: Java, React, Spring Boot"
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Gratification / Salaire</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="Ex: 600€/mois"
            />
          </div>

          <div className="form-group">
            <label htmlFor="internshipStartDate">Date de début du stage</label>
            <input
              type="date"
              id="internshipStartDate"
              name="internshipStartDate"
              value={formData.internshipStartDate}
              onChange={handleChange}
              className={errors.internshipStartDate ? 'input-error' : ''}
            />
            {errors.internshipStartDate && <p className="error-message">{errors.internshipStartDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="internshipDuration">Durée du stage</label>
            <input
              type="text"
              id="internshipDuration"
              name="internshipDuration"
              value={formData.internshipDuration}
              onChange={handleChange}
              placeholder="Ex: 6 mois"
            />
          </div>

          <div className="form-group">
            <label htmlFor="limitApplicationDate">Date limite de candidature</label>
            <input
              type="date"
              id="limitApplicationDate"
              name="limitApplicationDate"
              value={formData.limitApplicationDate}
              onChange={handleChange}
              className={errors.limitApplicationDate ? 'input-error' : ''}
            />
            {errors.limitApplicationDate && <p className="error-message">{errors.limitApplicationDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="studyLevel">Niveau d'étude minimum</label>
            <input
              type="text"
              id="studyLevel"
              name="studyLevel"
              value={formData.studyLevel}
              onChange={handleChange}
              placeholder="Ex: Bac+3, Master 1..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="remoteWorkPolicy">Politique de télétravail</label>
            <input
              type="text"
              id="remoteWorkPolicy"
              name="remoteWorkPolicy"
              value={formData.remoteWorkPolicy}
              onChange={handleChange}
              placeholder="Ex: Hybride, 2 jours par semaine..."
            />
          </div>

          {creationError && <p className="error-message creation-error">{creationError}</p>}
          {creationSuccess && <p className="success-message">{creationSuccess}</p>}

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={submitting}>
              {mode === 'edit' ? "Enregistrer les modifications" : "Publier l'offre"}
            </Button>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default OfferFormPage;