import React, { useEffect, useState } from 'react';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './MyOffersPage.css';
import { useAuth } from "../../../context/AuthContext.tsx";
import OfferService, { type OfferDto } from "../../../services/offer.service.ts";
import { Link } from "react-router-dom";
import Button from "../../../components/button/Button.tsx";

const MyOffersPage: React.FC = () => {
  const {user} = useAuth();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyOffers = async () => {
      if (!user || !user.entityId) {
        setError("Vous devez être connecté en tant qu'entreprise pour voir vos offres.");
        setLoading(false);
        return;
      }

      try {
        const companyOffers = await OfferService.getOffersByCompany(user.entityId);
        setOffers(companyOffers);
      } catch (err) {
        setError("Erreur lors du chargement de vos offres. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyOffers();
  }, [user]);

  const handleDelete = async (offerId: string) => {
    console.log("Deleting offer with ID:", offerId);
  };

  const handleEdit = (offerId: string) => {
    console.log("Editing offer with ID:", offerId);
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
          <h1 className="my-offers-title">Vos Offres de Stage</h1>
          <Link to="/company/create-offer">
            <Button variant="primary">Créer une nouvelle offre</Button>
          </Link>
        </div>
        {offers.length === 0 ? (
          <div className="no-offers-container">
            <p className="no-offers-message">Vous n'avez pas encore publié d'offres.</p>
            <Link to="/company/create-offer">
              <Button variant="primary">Créer votre première offre</Button>
            </Link>
          </div>
        ) : (
          <div className="offers-list">
            {offers.map(offer => (
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
                  <Link to={`/offers/${offer.id}/applications`}>
                    <Button variant='icon'><i className="fas fa-list"></i></Button>
                  </Link>
                  <Button variant="icon" onClick={() => handleEdit(offer.id)}>
                    <i className="fas fa-pencil-alt"></i>
                  </Button>
                  <Button variant="icon" onClick={() => handleDelete(offer.id)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="my-offers-page">
      <Header/>
      <main className="my-offers-container">
        {renderContent()}
      </main>
      <Footer/>
    </div>
  );
};

export default MyOffersPage;
