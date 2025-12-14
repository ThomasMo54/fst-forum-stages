import React, { useState } from 'react';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import Button from "../../../components/button/Button"; // Import the Button component
import './CreateOfferPage.css';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pour l'instant, on log juste les données
        console.log("Offre à créer :", formData);
        alert("Offre prête à être envoyée (voir console)");
    };

    return (
        <>
            <Header />
            <div className="create-offer-container">
                <h1 className="create-offer-title">Créer une offre de stage</h1>
                
                <form className="create-offer-form" onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="title">Titre de l'offre *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Développeur Fullstack React/Java"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Détaillez les missions, le profil recherché..."
                        />
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
                        />
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
                        />
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

                    <div className="form-actions">
                        <Button type="submit" variant="primary">Publier l'offre</Button>
                    </div>

                </form>
            </div>
            <Footer />
        </>
    );
};

export default CreateOfferPage;
