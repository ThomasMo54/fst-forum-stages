import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import './Header.css';
import user_roles from "../../constants/user_roles.ts";
import UserService from '../../services/user.service';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [name, setName] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'profile' | 'notifications' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserName = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await UserService.getDisplayName(user.entityId, user.roles);
          setName(response);
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    };
    fetchUserName();
  }, [isAuthenticated, user]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleProfile = () => {
      setActiveDropdown(activeDropdown === 'profile' ? null : 'profile');
  };

  const toggleNotifications = () => {
      setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications');
  };

  return (
    <header className="header">
      <div className="container">
        <nav>
          {/* Logo Section */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <i className="fa-solid fa-briefcase" style={{color: 'white', fontSize: '20px'}}></i>
            </div>
            <div className="logo-text">
              <span className="logo-main">Forum des Stages</span>
              <span className="logo-sub">Université de Lorraine</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <ul className="nav-menu">
            <li>
              <Link to="/" className={isActive('/')}>Accueil</Link>
            </li>

            <li>
              <Link to="/offers" className={isActive('/offers')}>Offres</Link>
            </li>

            {isAuthenticated && user?.roles.includes(user_roles.COMPANY) && (
              <li>
                <Link to="/company/my-offers" className={isActive('/company/my-offers')}>Vos Offres</Link>
              </li>
            )}

            {isAuthenticated && user?.roles.includes(user_roles.STUDENT) && (
              <li>
                <Link to="/student/my-applications" className={isActive('/student/my-offers')}>Mes postulations</Link>
              </li>
            )}

            {isAuthenticated && user?.roles.includes(user_roles.ADMIN) && (
              <li>
                <Link to="/admin/stats" className={isActive('/admin/stats')}>Statistiques</Link>
              </li>
            )}

            {/* User / Auth Section */}
            {isAuthenticated && user ? (
              <li className="auth-section">
                <div className="user-menu" ref={dropdownRef}>
                  <NotificationBell
                      isOpen={activeDropdown === 'notifications'}
                      onToggle={toggleNotifications}
                  />

                  <div
                    className="user-profile-container"
                    onClick={toggleProfile}
                  >
                      <div className="user-info">
                        <span className="user-name">{name}</span>
                        <span className="user-role">
                          {user.roles.includes(user_roles.ADMIN) ? 'Administrateur' :
                          user.roles.includes(user_roles.COMPANY) ? 'Entreprise' :
                          user.roles.includes(user_roles.STUDENT) ? 'Étudiant' : 'Utilisateur'}
                        </span>
                      </div>

                      <div className="profile-icon">
                          <i className="fa-solid fa-user"></i>
                      </div>

                      {/* Dropdown Menu */}
                      {activeDropdown === 'profile' && (
                        <div className="profile-dropdown">
                            <Link
                                to={user.roles.includes(user_roles.COMPANY) ? "/company/modify-infos" : "/student/modify-infos"}
                                className="dropdown-item"
                                onClick={() => setActiveDropdown(null)}
                            >
                                <i className="fa-solid fa-user-gear" style={{marginRight: '10px', width: '16px'}}></i>
                                Profil
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="dropdown-item danger"
                            >
                                <i className="fa-solid fa-right-from-bracket" style={{marginRight: '10px', width: '16px'}}></i>
                                Déconnexion
                            </button>
                        </div>
                      )}
                  </div>
                </div>
              </li>
            ) : (
              <li>
                <Link to="/login" className="btn-login">Connexion</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;