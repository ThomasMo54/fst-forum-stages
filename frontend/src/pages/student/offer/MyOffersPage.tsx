import Footer from "../../../components/footer/Footer.tsx";
import Header from "../../../components/header/Header.tsx";
import user_roles from "../../../constants/user_roles.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import ApplicationService from "../../../services/application.service.ts";
import React, { useEffect, useState } from 'react';
import type { OfferDto } from "../../../services/offer.service.ts";
import './MyOffersPage.css';
import OfferService from "../../../services/offer.service.ts";


const StudentMyOffersPage: React.FC = () => {
    const {user} = useAuth();
    const [offers, setOffers] = useState<OfferDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyOffers = async () => {
            if ((!user || !user.entityId) && !user!.roles.includes(user_roles.STUDENT)) {
                setError("Vous devez être connecté en tant qu'étudiant pour voir vos offres.");
                setLoading(false);
                return;
            }
            try {
                const studentApplications = await ApplicationService.getAllApplicationForStudent(user!.entityId);
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

        fetchMyOffers();
    }, [user]);

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
                        <p>Vous n'avez postulé à aucune offre pour le moment.</p>
                    </div>
                ) : (
                    <div className="offers-list">
                        {offers.map((offer) => (
                            <div key={offer.id} className="offer-card">
                                <h2>{offer.title}</h2>
                                <p>{offer.description.substring(0, 100)}...</p>
                                <p><strong>Salaire:</strong> {offer.salary || 'Non spécifié'}</p>
                                <p><strong>Date de création:</strong> {new Date(offer.creationDate).toLocaleDateString()}</p>
                                <p><strong>Début:</strong> {new Date(offer.internshipStartDate).toLocaleDateString()}</p>
                                <p><strong>Date limite:</strong> {new Date(offer.limitApplicationDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
    return (
        <div className="my-offers-page">
            <Header />
            <main className="my-offers-container">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default StudentMyOffersPage;
