import Footer from "../../../components/footer/Footer.tsx";
import Header from "../../../components/header/Header.tsx";
import user_roles from "../../../constants/user_roles.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import ApplicationService, { type ApplicationDto } from "../../../services/application.service.ts";
import React, { useEffect, useState } from 'react';
import OfferService, { type OfferDto } from "../../../services/offer.service.ts";
import './MyApplicationsPage.css';
import { Link } from "react-router-dom";
import Button from "../../../components/button/Button.tsx";


const StudentMyApplicationsPage: React.FC = () => {
    const {user} = useAuth();
    const [offers, setOffers] = useState<OfferDto[]>([]);
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyApplications = async () => {
            if ((!user || !user.entityId) && !user!.roles.includes(user_roles.STUDENT)) {
                setError("Vous devez être connecté en tant qu'étudiant pour voir vos applications.");
                setLoading(false);
                return;
            }
            try {
                const studentApplications = await ApplicationService.getAllApplicationForStudent(user!.entityId);
                setApplications(studentApplications);

                const studentOffers:OfferDto[] = [];
                for(const app of studentApplications){
                    studentOffers.push(await OfferService.getOfferById(app.offerId));
                }

                setOffers(studentOffers);
            } catch (err) {
                setError("Erreur lors du chargement de vos offres. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyApplications();
    }, [user]);

    const handleDelete = async (applicationId: string) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette offre ?")) {
            await ApplicationService.deleteApplication(applicationId);

            setOffers(offers.filter(offer => offer.id !== applications.find(app => app.id === applicationId)!.offerId));
            setApplications(applications.filter(app => app.id !== applicationId));

            var deleteUrl = await ApplicationService.getCoverLetterDeleteUrl(applicationId);
            fetch(deleteUrl, { method: 'DELETE' });
        }
    };

    const handleDownload = async (applicationId: string) => {
        const coverLetterUrl = await ApplicationService.getCoverLetterUrl(applicationId);
        window.open(coverLetterUrl, '_blank');
    };


    const renderContent = () => {
        if (loading) {
            return <p>Chargement de vos offres...</p>;
        }

        if (error) {
            return <p className="error-message">{error}</p>;
        }

        return (
            <>
                <div className="my-offers-title-container">
                    <h1 className="my-offers-title">Offres de Stage auquels vous avez postulé</h1>
                </div>
                {offers.length === 0 ? (
                    <div className="no-offers-container">
                        <p className="no-offers-message">Vous n'avez postulé à aucune offre pour le moment.</p>
                    </div>
                ) : (
                    <div className="offers-list">
                        {offers.map((offer) => (
                            <div key={offer.id} className="offer-card">
                                <div className="offer-card-header">
                                    <h2>{offer.title}</h2>
                                    <span className="creation-date">Publié le {new Date(offer.creationDate).toLocaleDateString()}</span>
                                </div>
                                
                                <p className="offer-description">{offer.description.substring(0, 100)}...</p>
                                
                                <div className="offer-details-grid">
                                    <div className="detail-item">
                                        <i className="fa-solid fa-euro-sign"></i>
                                        <span>{offer.salary || 'Non spécifié'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fa-regular fa-calendar"></i>
                                        <span>Début: {new Date(offer.internshipStartDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fa-regular fa-hourglass-half"></i>
                                        <span>Limite: {new Date(offer.limitApplicationDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="offer-actions">
                                    <Button variant="icon" onClick={() => handleDownload(applications.find(app => app.offerId === offer.id)!.id)} >
                                        <i className="fas fa-eye"></i>
                                    </Button>
                                    <Link to={`/offers/${offer.id}/apply/${applications.find(app => app.offerId === offer.id)!.id}`}>
                                        <Button variant="icon"><i className="fas fa-pencil-alt"></i></Button>
                                    </Link>
                                    <Button variant="icon" onClick={() => handleDelete(applications.find(app => app.offerId === offer.id)!.id)}>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
    return (
        <div className="my-applications-page">
            <Header />
            <main className="my-offers-container">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default StudentMyApplicationsPage;
