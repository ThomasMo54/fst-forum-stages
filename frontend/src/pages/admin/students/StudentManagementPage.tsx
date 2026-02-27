import React, { useEffect, useState } from 'react';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Button from '../../../components/button/Button';
import UserService, { type UserDto } from '../../../services/user.service';
import StudentService, { type StudentDto } from '../../../services/student.service';
import ApplicationService, { type ApplicationDto } from '../../../services/application.service';
import OfferService, { type OfferDto } from '../../../services/offer.service';
import roles from '../../../constants/user_roles';
import '../admin-shared.css';
import '../../../styles/global.css';

interface StudentWithDetails {
    user: UserDto;
    student?: StudentDto;
}

interface ApplicationWithOffer extends ApplicationDto {
    offer?: OfferDto;
}

interface AccordionData {
    applications: ApplicationWithOffer[];
    loading: boolean;
    loaded: boolean;
}

const PAGE_SIZE = 10;

const StudentManagementPage: React.FC = () => {
    const [allStudents, setAllStudents] = useState<StudentWithDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
    const [accordionData, setAccordionData] = useState<Record<string, AccordionData>>({});

    const totalPages = Math.ceil(allStudents.length / PAGE_SIZE);
    const pagedStudents = allStudents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        setPage(0);
        setOpenAccordions(new Set());
        setAccordionData({});
        try {
            // Charge tout (taille large pour tout récupérer)
            const response = await UserService.getUsers(0, 1000, roles.STUDENT);
            const users = response.content;

            const withDetails: StudentWithDetails[] = await Promise.all(
                users.map(async (user) => {
                    if (!user.entityId) return { user };
                    try {
                        const student = await StudentService.getStudentById(user.entityId);
                        return { user, student };
                    } catch {
                        return { user };
                    }
                })
            );
            setAllStudents(withDetails);
        } catch (err) {
            setError('Erreur lors de la récupération des étudiants.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
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

        // Toujours recharger à chaque ouverture
        setAccordionData(prev => ({
            ...prev,
            [userId]: { applications: [], loading: true, loaded: false }
        }));

        try {
            const appsData = await ApplicationService.getAllApplicationForStudent(entityId);
            const appsWithOffers = await Promise.all(
                appsData.map(async (app) => {
                    try {
                        const offer = await OfferService.getOfferById(app.offerId);
                        return { ...app, offer };
                    } catch {
                        return app;
                    }
                })
            );
            setAccordionData(prev => ({
                ...prev,
                [userId]: { applications: appsWithOffers, loading: false, loaded: true }
            }));
        } catch (err) {
            console.error(err);
            setAccordionData(prev => ({
                ...prev,
                [userId]: { applications: [], loading: false, loaded: true }
            }));
        }
    };

    const handleDelete = async (userId: string, name: string) => {
        if (!window.confirm(`Supprimer l'étudiant "${name}" ?`)) return;
        try {
            await UserService.deleteUser(userId);
            setOpenAccordions(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            fetchStudents();
        } catch (err) {
            alert("Erreur lors de la suppression.");
            console.error(err);
        }
    };

    const getAppStatus = (app: ApplicationDto) => {
        if (app.accepted) return { label: 'Acceptée', className: 'status-accepted' };
        if (app.rejected) return { label: 'Refusée', className: 'status-rejected' };
        return { label: 'En attente', className: 'status-pending' };
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="admin-main">
                <div className="container">
                    <section className="admin-hero">
                        <p className="eyebrow">Administration</p>
                        <h1>Gestion des étudiants</h1>
                    </section>

                    <section className="admin-section">
                        <div className="section-header">
                            <div className="filters">
                                <Button size="small" variant="secondary" onClick={fetchStudents}>
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
                        ) : allStudents.length === 0 ? (
                            <div className="empty-state">
                                <p>Aucun étudiant trouvé.</p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-list">
                                    {pagedStudents.map((item) => {
                                        const displayName = item.student
                                            ? `${item.student.firstName} ${item.student.lastName}`
                                            : item.user.email;
                                        const isOpen = openAccordions.has(item.user.id);
                                        const data = accordionData[item.user.id];

                                        return (
                                            <div key={item.user.id} className={`admin-accordion-item ${isOpen ? 'accordion-open' : ''}`}>
                                                {/* Row */}
                                                <div className="admin-item-content">
                                                    <div className="admin-item-avatar student">
                                                        <i className="fa-solid fa-user-graduate"></i>
                                                    </div>
                                                    <div className="admin-item-info">
                                                        <span className="admin-item-name">{displayName}</span>
                                                        <span className="admin-item-sub">
                              {item.student
                                  ? `${item.student.fieldOfStudy} · Année ${item.student.yearOfStudy} · ${item.user.email}`
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
                                                            onClick={() => handleDelete(item.user.id, displayName)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Accordion panel */}
                                                {isOpen && (
                                                    <div className="accordion-panel">
                                                        {!item.student ? (
                                                            <p className="accordion-empty">Détails indisponibles pour cet étudiant.</p>
                                                        ) : (
                                                            <>
                                                                {/* Profil */}
                                                                <div className="accordion-section">
                                                                    <h4 className="accordion-section-title">Profil</h4>
                                                                    <div className="accordion-info-grid">
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">N° étudiant</span>
                                                                            <span className="accordion-info-value">{item.student.studentNumber || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Niveau</span>
                                                                            <span className="accordion-info-value">{item.student.educationLevel || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Filière</span>
                                                                            <span className="accordion-info-value">{item.student.fieldOfStudy || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Spécialisation</span>
                                                                            <span className="accordion-info-value">{item.student.specialization || 'Non renseigné'}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Année</span>
                                                                            <span className="accordion-info-value">{item.student.yearOfStudy}</span>
                                                                        </div>
                                                                        <div className="accordion-info-item">
                                                                            <span className="accordion-info-label">Téléphone</span>
                                                                            <span className="accordion-info-value">{item.student.phone || 'Non renseigné'}</span>
                                                                        </div>
                                                                    </div>
                                                                    {item.student.skills && item.student.skills.length > 0 && (
                                                                        <div className="accordion-skills">
                                                                            <span className="accordion-info-label">Compétences</span>
                                                                            <div className="accordion-skills-tags">
                                                                                {item.student.skills.map((skill, i) => (
                                                                                    <span key={i} className="skill-tag">{skill}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Stats + Candidatures */}
                                                                <div className="accordion-section">
                                                                    <h4 className="accordion-section-title">Candidatures</h4>
                                                                    {data?.loading ? (
                                                                        <div className="accordion-loading">
                                                                            <i className="fa-solid fa-spinner fa-spin"></i> Chargement...
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            {data?.loaded && (
                                                                                <div className="accordion-stats">
                                                                                    <div className="accordion-stat">
                                                                                        <span className="accordion-stat-number">{data.applications.length}</span>
                                                                                        <span className="accordion-stat-label">Total</span>
                                                                                    </div>
                                                                                    <div className="accordion-stat accepted">
                                                                                        <span className="accordion-stat-number">{data.applications.filter(a => a.accepted).length}</span>
                                                                                        <span className="accordion-stat-label">Acceptées</span>
                                                                                    </div>
                                                                                    <div className="accordion-stat rejected">
                                                                                        <span className="accordion-stat-number">{data.applications.filter(a => a.rejected).length}</span>
                                                                                        <span className="accordion-stat-label">Refusées</span>
                                                                                    </div>
                                                                                    <div className="accordion-stat pending">
                                                                                        <span className="accordion-stat-number">{data.applications.filter(a => !a.accepted && !a.rejected).length}</span>
                                                                                        <span className="accordion-stat-label">En attente</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {data?.applications.length === 0 ? (
                                                                                <p className="accordion-empty">Aucune candidature pour le moment.</p>
                                                                            ) : (
                                                                                <div className="accordion-list">
                                                                                    {data?.applications.map((app) => {
                                                                                        const status = getAppStatus(app);
                                                                                        return (
                                                                                            <div key={app.id} className="accordion-list-item">
                                                                                                <div className="accordion-list-item-info">
                                                  <span className="accordion-list-item-title">
                                                    {app.offer?.title || `Offre #${app.offerId}`}
                                                  </span>
                                                                                                    {app.offer && (
                                                                                                        <span className="accordion-list-item-sub">
                                                      Limite : {new Date(app.offer.limitApplicationDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className={`status-badge ${status.className}`}>
                                                  {status.label}
                                                </span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination frontend */}
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

export default StudentManagementPage;