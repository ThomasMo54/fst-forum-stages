import React, { useEffect, useState } from 'react';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Button from '../../../components/button/Button';
import UserService, { type UserDto } from '../../../services/user.service';
import CompanyService, { type CompanyDto } from '../../../services/company.service';
import OfferService, { type OfferDto } from '../../../services/offer.service';
import roles from '../../../constants/user_roles';
import '../admin-shared.css';
import '../../../styles/global.css';

interface CompanyWithDetails {
    user: UserDto;
    company?: CompanyDto;
}

interface AccordionData {
    offers: OfferDto[];
    loading: boolean;
    loaded: boolean;
}

const PAGE_SIZE = 10;

const CompanyManagementPage: React.FC = () => {
    const [allCompanies, setAllCompanies] = useState<CompanyWithDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
    const [accordionData, setAccordionData] = useState<Record<string, AccordionData>>({});

    const totalPages = Math.ceil(allCompanies.length / PAGE_SIZE);
    const pagedCompanies = allCompanies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const fetchCompanies = async () => {
        setLoading(true);
        setError('');
        setPage(0);
        setOpenAccordions(new Set());
        setAccordionData({});
        try {
            const response = await UserService.getUsers(0, 1000, roles.COMPANY);
            const users = response.content;

            const withDetails: CompanyWithDetails[] = await Promise.all(
                users.map(async (user) => {
                    if (!user.entityId) return { user };
                    try {
                        const company = await CompanyService.getCompanyById(user.entityId);
                        return { user, company };
                    } catch {
                        return { user };
                    }
                })
            );
            setAllCompanies(withDetails);
        } catch (err) {
            setError('Erreur lors de la récupération des entreprises.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const toggleAccordion = async (userId: string, entityId: string | null) => {
        const isOpen = openAccordions.has(userId);

        if (isOpen) {
            setOpenAccordions(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            return;
        }

        setOpenAccordions(prev => new Set([...prev, userId]));

        if (!entityId) return;

        setAccordionData(prev => ({
            ...prev,
            [userId]: { offers: [], loading: true, loaded: false }
        }));

        try {
            const data = await OfferService.getOffersByCompany(entityId, 0);
            setAccordionData(prev => ({
                ...prev,
                [userId]: { offers: data.content, loading: false, loaded: true }
            }));
        } catch (err) {
            console.error(err);
            setAccordionData(prev => ({
                ...prev,
                [userId]: { offers: [], loading: false, loaded: true }
            }));
        }
    };

    const handleDeleteCompany = async (userId: string, name: string) => {
        if (!window.confirm(`Supprimer l'entreprise "${name}" ?`)) return;
        try {
            await UserService.deleteUser(userId);
            setOpenAccordions(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            fetchCompanies();
        } catch (err) {
            alert("Erreur lors de la suppression.");
            console.error(err);
        }
    };

    const handleDeleteOffer = async (offerId: string, offerTitle: string, userId: string, entityId: string | null) => {
        if (!window.confirm(`Supprimer l'offre "${offerTitle}" ?`)) return;
        try {
            await OfferService.deleteOffer(offerId);
            if (!entityId) return;
            setAccordionData(prev => ({
                ...prev,
                [userId]: { ...prev[userId], loading: true }
            }));
            const data = await OfferService.getOffersByCompany(entityId, 0);
            setAccordionData(prev => ({
                ...prev,
                [userId]: { offers: data.content, loading: false, loaded: true }
            }));
        } catch (err) {
            alert("Erreur lors de la suppression de l'offre.");
            console.error(err);
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="admin-main">
                <div className="container">
                    <section className="admin-hero">
                        <p className="eyebrow">Administration</p>
                        <h1>Gestion des entreprises</h1>
                        <p className="lead">
                            {allCompanies.length} entreprise{allCompanies.length !== 1 ? 's' : ''} inscrite{allCompanies.length !== 1 ? 's' : ''}
                        </p>
                    </section>

                    <section className="admin-section">
                        <div className="section-header">
                            <div className="filters">
                                <Button size="small" variant="secondary" onClick={fetchCompanies}>
                                    <i className="fa-solid fa-rotate" style={{ marginRight: '6px' }}></i>
                                    Actualiser
                                </Button>
                            </div>
                        </div>

                        {error && <div className="error-message inline-error">{error}</div>}

                        {loading ? (
                            <div className="admin-list loading">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="admin-list-item skeleton-item">
                                        <div className="skeleton-line" />
                                    </div>
                                ))}
                            </div>
                        ) : allCompanies.length === 0 ? (
                            <div className="empty-state">
                                <p>Aucune entreprise trouvée.</p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-list">
                                    {pagedCompanies.map((item) => {
                                        const displayName = item.company?.name || item.user.email;
                                        const isOpen = openAccordions.has(item.user.id);
                                        const data = accordionData[item.user.id];

                                        return (
                                            <div key={item.user.id} className={`admin-accordion-item ${isOpen ? 'accordion-open' : ''}`}>
                                                {/* Row */}
                                                <div className="admin-item-content">
                                                    <div className="admin-item-avatar company">
                                                        <i className="fa-solid fa-building"></i>
                                                    </div>
                                                    <div className="admin-item-info">
                                                        <span className="admin-item-name">{displayName}</span>
                                                        <span className="admin-item-sub">
                              {item.company
                                  ? `${item.company.city || 'Ville inconnue'} · ${item.company.country || ''} · ${item.user.email}`
                                  : item.user.email}
                            </span>
                                                    </div>
                                                    <div className="admin-item-actions">
                            <span className="admin-item-date">
                              {new Date(item.user.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                                                        <Button
                                                            variant="secondary"
                                                            size="small"
                                                            onClick={() => toggleAccordion(item.user.id, item.user.entityId)}
                                                        >
                                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ marginRight: '6px' }}></i>
                                                            {isOpen ? 'Masquer' : 'Détails'}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="small"
                                                            onClick={() => handleDeleteCompany(item.user.id, displayName)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Accordion panel */}
                                                {isOpen && (
                                                    <div className="accordion-panel">
                                                        {!item.company ? (
                                                            <p className="accordion-empty">Détails indisponibles pour cette entreprise.</p>
                                                        ) : (
                                                            <>
                                                                {/* Infos */}
                                                                <div className="accordion-section">
                                                                    <h4 className="accordion-section-title">Informations</h4>
                                                                    <div className="accordion-info-grid">
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Email de contact</span>
                                                                            <span className="accordion-info-value">{item.company.contactEmail || 'Non renseigné'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Adresse</span>
                                                                            <span className="accordion-info-value">{item.company.streetAddress || 'Non renseignée'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Ville</span>
                                                                            <span className="accordion-info-value">{item.company.city || 'Non renseignée'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Code postal</span>
                                                                            <span className="accordion-info-value">{item.company.postalCode || 'Non renseigné'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Pays</span>
                                                                            <span className="accordion-info-value">{item.company.country || 'Non renseigné'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Offres */}
                                                                <div className="accordion-section">
                                                                    <h4 className="accordion-section-title">Offres publiées</h4>
                                                                    {data?.loading ? (
                                                                        <div className="accordion-loading">
                                                                            <i className="fa-solid fa-spinner fa-spin"></i> Chargement...
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            {data?.loaded && (
                                                                                <div className="accordion-stats">
                                                                                    <div className="accordion-stat">
                                                                                        <span className="accordion-stat-number">{data.offers.length}</span>
                                                                                        <span className="accordion-stat-label">Total</span>
                                                                                    </div>
                                                                                    <div className="accordion-stat accepted">
                                                                                        <span className="accordion-stat-number">{data.offers.filter(o => o.offerOpen).length}</span>
                                                                                        <span className="accordion-stat-label">Ouvertes</span>
                                                                                    </div>
                                                                                    <div className="accordion-stat rejected">
                                                                                        <span className="accordion-stat-number">{data.offers.filter(o => !o.offerOpen).length}</span>
                                                                                        <span className="accordion-stat-label">Clôturées</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {data?.offers.length === 0 ? (
                                                                                <p className="accordion-empty">Aucune offre publiée pour le moment.</p>
                                                                            ) : (
                                                                                <div className="accordion-list">
                                                                                    {data?.offers.map((offer) => (
                                                                                        <div key={offer.id} className="accordion-list-item">
                                                                                            <div className="accordion-list-item-info">
                                                                                                <span className="accordion-list-item-title">{offer.title}</span>
                                                                                                <span className="accordion-list-item-sub">
                                                  Créée le {new Date(offer.creationDate).toLocaleDateString('fr-FR')}
                                                                                                    {' · '}Limite : {new Date(offer.limitApplicationDate).toLocaleDateString('fr-FR')}
                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                                <span className={`status-badge ${offer.offerOpen ? 'status-accepted' : 'status-rejected'}`}>
                                                  {offer.offerOpen ? 'Ouverte' : 'Clôturée'}
                                                </span>
                                                                                                <Button
                                                                                                    variant="danger"
                                                                                                    size="small"
                                                                                                    onClick={() => handleDeleteOffer(offer.id, offer.title, item.user.id, item.user.entityId)}
                                                                                                >
                                                                                                    <i className="fa-solid fa-trash"></i>
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Supprimer entreprise */}
                                                                <div className="accordion-section accordion-danger-zone">
                                                                    <Button
                                                                        variant="danger"
                                                                        size="small"
                                                                        onClick={() => handleDeleteCompany(item.user.id, displayName)}
                                                                    >
                                                                        <i className="fa-solid fa-trash" style={{ marginRight: '8px' }}></i>
                                                                        Supprimer l'entreprise
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            disabled={page === 0}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            Précédent
                                        </Button>
                                        <span className="page-info">Page {page + 1} sur {totalPages}</span>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            disabled={page >= totalPages - 1}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CompanyManagementPage;