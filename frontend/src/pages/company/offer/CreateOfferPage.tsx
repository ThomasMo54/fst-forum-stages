import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Button from '../../../components/button/Button';
import './CreateOfferPage.css';
import { useAuth } from '../../../context/AuthContext';
import OfferService, { type CreateOfferDto } from '../../../services/offer.service';

interface CreateOfferForm {
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

const CreateOfferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateOfferForm>({
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
  const [errors, setErrors] = useState<Partial<CreateOfferForm>>({});
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<CreateOfferForm> = {};
    if (!formData.title) newErrors.title = "Le titre de l'offre est requis.";
    if (formData.title.length > 100) newErrors.title = "Le titre ne doit pas depasser 100 caracteres.";
    if (!formData.description) newErrors.description = "La description de l'offre est requise.";
    if (!formData.internshipStartDate) newErrors.internshipStartDate = "La date de debut du stage est requise.";
    if (!formData.limitApplicationDate) newErrors.limitApplicationDate = "La date limite de candidature est requise.";

    const today = new Date().toISOString().split('T')[0];
    if (formData.internshipStartDate && formData.internshipStartDate < today) {
      newErrors.internshipStartDate = "La date de debut du stage ne peut pas etre dans le passe.";
    }
    if (formData.limitApplicationDate && formData.limitApplicationDate < today) {
      newErrors.limitApplicationDate = "La date limite de candidature ne peut pas etre dans le passe.";
    }
    if (formData.internshipStartDate && formData.limitApplicationDate && formData.limitApplicationDate > formData.internshipStartDate) {
      newErrors.limitApplicationDate = "La date limite de candidature ne peut pas etre apres la date de debut du stage.";
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
      setCreationError("Erreur : L'identifiant de l'entreprise n'a pas pu etre recupere.");
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
      await OfferService.createOffer(offerData);
      setCreationSuccess("Offre publiee avec succes.");
      navigate('/company/my-offers');
    } catch (error) {
      setCreationError("Une erreur est survenue lors de la publication de l'offre. Veuillez reessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="create-offer-container">
        <h1 className="create-offer-title">Creer une offre de stage</h1>

        <form className="create-offer-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">Titre de l'offre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Developpeur Fullstack React/Java"
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
              placeholder="Detaillez les missions, le profil recherche..."
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <p className="error-message">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (separes par des virgules)</label>
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
            <label htmlFor="internshipStartDate">Date de debut du stage</label>
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
            <label htmlFor="internshipDuration">Duree du stage</label>
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
            <label htmlFor="studyLevel">Niveau d'etude minimum</label>
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
            <label htmlFor="remoteWorkPolicy">Politique de teletravail</label>
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
              {submitting ? "Publication..." : "Publier l'offre"}
            </Button>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateOfferPage;
