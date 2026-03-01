import React, { useEffect, useState } from 'react';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Button from '../../../components/button/Button';
import UserService, { type UserDto } from '../../../services/user.service';
import roles from '../../../constants/user_roles';
import './UserManagementPage.css';
import '../../../styles/global.css';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await UserService.getUsers(page, pageSize, roleFilter || undefined);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      try {
        await UserService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        alert("Erreur lors de la suppression de l'utilisateur.");
        console.error(err);
      }
    }
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(0);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="user-management-main">
        <div className="container">
          <section className="admin-hero">
            <p className="eyebrow">Administration</p>
            <h1>Gestion des utilisateurs</h1>
            <p className="lead">Consultez et gérez les comptes utilisateurs du forum.</p>
          </section>

          <section className="users-section">
            <div className="section-header">
              <div className="filters">
                <select value={roleFilter} onChange={handleRoleFilterChange} className="role-select">
                  <option value="">Tous les rôles</option>
                  <option value={roles.ADMIN}>Administrateur</option>
                  <option value={roles.COMPANY}>Entreprise</option>
                  <option value={roles.STUDENT}>Étudiant</option>
                </select>
                <Button size="small" variant="secondary" onClick={() => fetchUsers()}>
                  Actualiser
                </Button>
              </div>
            </div>

            {error && <div className="error-message inline-error">{error}</div>}

            {loading ? (
              <div className="users-list loading">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="user-list-item skeleton-item">
                    <div className="skeleton-line" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <p>Aucun utilisateur ne correspond aux critères.</p>
              </div>
            ) : (
              <div className="users-list">
                {users.map((user) => (
                  <div key={user.id} className="user-list-item">
                    <div className="user-item-content">
                      <div className="user-info">
                        <span className="user-email">
                          {user.role === roles.STUDENT ? (user.displayName ?? user.email) : user.email}
                        </span>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role === roles.ADMIN ? 'Administrateur' : 
                           user.role === roles.COMPANY ? 'Entreprise' : 
                           user.role === roles.STUDENT ? 'Étudiant' : user.role}
                        </span>
                      </div>
                      <div className="user-actions">
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pagination">
              <Button
                variant="secondary"
                size="small"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="page-info">
                Page {page + 1} sur {totalPages || 1}
              </span>
              <Button
                variant="secondary"
                size="small"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserManagementPage;
