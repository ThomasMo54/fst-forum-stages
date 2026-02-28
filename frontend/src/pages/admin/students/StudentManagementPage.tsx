import React, { useEffect, useState, useMemo } from 'react';
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

    // Filtres
    const [searchName, setSearchName] = useState('');
    const [filterField, setFilterField] = useState('');
    const [filterLevel, setFilterLevel] = useState('');

    // Valeurs uniques pour les selects
    const uniqueFields = useMemo(() =>
            [...new Set(allStudents.map(s => s.student?.fieldOfStudy).filter(Boolean))] as string[],
        [allStudents]
    );
    const uniqueLevels = useMemo(() =>
            [...new Set(allStudents.map(s => s.student?.educationLevel).filter(Boolean))] as string[],
        [allStudents]
    );

    const filteredStudents = useMemo(() => {
        return allStudents.filter(item => {
            const name = item.student
                ? `${item.student.firstName} ${item.student.lastName}`.toLowerCase()
                : item.user.email.toLowerCase();
            const matchName = !searchName || name.includes(searchName.toLowerCase());
            const matchField = !filterField || item.student?.fieldOfStudy === filterField;
            const matchLevel = !filterLevel || item.student?.educationLevel === filterLevel;
            return matchName && matchField && matchLevel;
        });
    }, [allStudents, searchName, filterField, filterLevel]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const pagedStudents = filteredStudents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const resetFilters = () => {
        setSearchName('');
        setFilterField('');
        setFilterLevel('');
        setPage(0);
    };

    const hasActiveFilters = searchName || filterField || filterLevel;

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        setPage(0);
        setOpenAccordions(new Set());
        setAccordionData({});
        resetFilters();
        try {
            const response = await UserService.getUsers(0, 1000, roles.STUDENT);
            const withDetails: StudentWithDetails[] = await Promise.all(
                response.content.map(async (user) => {
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

    // Reset page quand les filtres changent
    useEffect(() => {
        setPage(0);
    }, [searchName, filterField, filterLevel]);

    const toggleAccordion = async (userId: string, entityId: string | null) => {
        const isOpen = openAccordions.has(userId);
        if (isOpen) {
            setOpenAccordions(prev => { const next = new Set(prev); next.delete(userId); return next; });
            return;
        }
        setOpenAccordions(prev => new Set([...prev, userId]));
        if (!entityId) return;
        setAccordionData(prev => ({ ...prev, [userId]: { applications: [], loading: true, loaded: false } }));
        try {
            const appsData = await ApplicationService.getAllApplicationForStudent(entityId);
            const appsWithOffers = await Promise.all(
                appsData.map(async (app) => {
                    try { const offer = await OfferService.getOfferById(app.offerId); return { ...app, offer }; }
                    catch { return app; }
                })
            );
            setAccordionData(prev => ({ ...prev, [userId]: { applications: appsWithOffers, loading: false, loaded: true } }));
        } catch {
            setAccordionData(prev => ({ ...prev, [userId]: { applications: [], loading: false, loaded: true } }));
        }
    };

    const handleDelete = async (userId: string, name: string) => {
        if (!window.confirm(`Supprimer l'étudiant "${name}" ?`)) return;
        try {
            await UserService.deleteUser(userId);
            setOpenAccordions(prev => { const next = new Set(prev); next.delete(userId); return next; });
            fetchStudents();
        } catch {
            alert("Erreur lors de la suppression.");
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
                        {!loading && (
                            <div className="admin-hero-stats">
                                <div className="admin-hero-stat">
                                    <i className="fa-solid fa-user-graduate"></i>
                                    <span className="admin-hero-stat-number">{filteredStudents.length}</span>
                                    <span className="admin-hero-stat-label">
                                       étudiant{filteredStudents.length !== 1 ? 's' : ''}
                                          {hasActiveFilters
                                              ? ' trouvé' + (filteredStudents.length !== 1 ? 's' : '')
                                              : ' inscrit' + (filteredStudents.length !== 1 ? 's' : '')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="admin-section">
                        {/* Barre de filtres */}
                        <div className="admin-filters-bar">
                            <div className="admin-filter-search">
                                <i className="fa-solid fa-magnifying-glass admin-filter-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom..."
                                    value={searchName}
                                    onChange={e => setSearchName(e.target.value)}
                                    className="admin-filter-input"
                                />
                                {searchName && (
                                    <button className="admin-filter-clear" onClick={() => setSearchName('')}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>

                            <select
                                value={filterField}
                                onChange={e => setFilterField(e.target.value)}
                                className={`admin-filter-select ${filterField ? 'active' : ''}`}
                            >
                                <option value="">Toutes les filières</option>
                                {uniqueFields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>

                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className={`admin-filter-select ${filterLevel ? 'active' : ''}`}
                            >
                                <option value="">Tous les niveaux</option>
                                {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>

                            {hasActiveFilters && (
                                <button className="admin-filter-reset" onClick={resetFilters}>
                                    <i className="fa-solid fa-filter-circle-xmark" style={{ marginRight: '6px' }}></i>
                                    Réinitialiser
                                </button>
                            )}

                            <Button size="small" variant="secondary" onClick={fetchStudents}>
                                <i className="fa-solid fa-rotate" style={{ marginRight: '6px' }}></i>
                                Actualiser
                            </Button>
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
                        ) : filteredStudents.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa-solid fa-user-slash" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '12px', display: 'block' }}></i>
                                <p>{hasActiveFilters ? 'Aucun étudiant ne correspond aux filtres.' : 'Aucun étudiant trouvé.'}</p>
                                {hasActiveFilters && (
                                    <button className="admin-filter-reset" onClick={resetFilters} style={{ margin: '8px auto 0' }}>
                                        Réinitialiser les filtres
                                    </button>
                                )}
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
                                                        <Button variant="secondary" size="small" onClick={() => toggleAccordion(item.user.id, item.user.entityId)}>
                                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ marginRight: '6px' }}></i>
                                                            {isOpen ? 'Masquer' : 'Détails'}
                                                        </Button>
                                                        <Button variant="danger" size="small" onClick={() => handleDelete(item.user.id, displayName)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div className="accordion-panel">
                                                        {!item.student ? (
                                                            <p className="accordion-empty">Détails indisponibles pour cet étudiant.</p>
                                                        ) : (
                                                            <>
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
                                                                                                <span className={`status-badge ${status.className}`}>{status.label}</span>
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

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <Button variant="secondary" size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                            Précédent
                                        </Button>
                                        <span className="page-info">Page {page + 1} sur {totalPages}</span>
                                        <Button variant="secondary" size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
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