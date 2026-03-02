import React, { useEffect, useState } from 'react';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './MyOffersPage.css';
import { useAuth } from "../../../context/AuthContext.tsx";
import OfferService, { type PaginatedOffers } from "../../../services/offer.service.ts";
import ApplicationService from "../../../services/application.service.ts";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button.tsx";
import {Pagination} from "../../../components/pagination/Pagination.tsx";

const MyOffersPage: React.FC = () => {
  const {user} = useAuth();
  const [offers, setOffers] = useState<PaginatedOffers>({content: [], page: {size: 0, number: 0, totalElements: 0, totalPages: 0}});
  const [applicationCounts, setApplicationCounts] = useState<{[key: string]: number}>({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const currentPage = Number(searchParams.get('page')) || 1;

    const fetchMyOffers = async () => {
        if (!user || !user.entityId) {
            setError("Vous devez être connecté en tant qu'entreprise pour voir vos offres.");
            setLoading(false);
            return;
        }

        try {
            const companyOffers = await OfferService.getOffersByCompany(user.entityId);
            setOffers(companyOffers);

             // Fetch application counts for each offer
            const counts: {[key: string]: number} = {};
            for (const offer of companyOffers.content) {
                const count = await ApplicationService.getNumberOfApplicationsForOffer(offer.id);
                counts[offer.id] = count;
            }
            setApplicationCounts(counts);
        } catch (err) {
            setError("Erreur lors du chargement de vos offres. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchMyOffers();
  }, [user]);

  const handleDelete = async (offerId: string) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.");
    if (!confirmDelete) return;

    try {
      await OfferService.deleteOffer(offerId);
      await fetchMyOffers();
    } catch (err) {
      setError("Erreur lors de la suppression de l'offre. Veuillez réessayer.");
    }
  };

  const handleEdit = (offerId: string) => {
    navigate(`/company/edit-offer/${offerId}`);
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
        {offers.content?.length === 0 ? (
          <div className="no-offers-container">
            <p className="no-offers-message">Vous n'avez pas encore publié d'offres.</p>
            <Link to="/company/create-offer">
              <Button variant="primary">Créer votre première offre</Button>
            </Link>
          </div>
        ) : (
          <div className="offers-list">
            {offers.content?.map(offer => (
              <div key={offer.id} className={`offer-card ${offer.offerOpen === false ? 'offer-closed' : ''}`}>
                <div className="offer-card-header">
                    <div className="offer-title-row">
                      <h2>{offer.title}</h2>
                      {offer.offerOpen === false && <span className="offer-closed-badge">Offre clôturée</span>}
                    </div>
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
                  <Link to={`/offers/${offer.id}/applications`} className="application-button-container">
                    <Button variant='icon'><i className="fas fa-list"></i></Button>
                    <span className="application-badge">{applicationCounts[offer.id] || 0}</span>
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

            {offers.page.totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={offers.page.totalPages}
                />
            )}
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
