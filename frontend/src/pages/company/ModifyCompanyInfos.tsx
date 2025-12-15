import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.tsx";
import { Link, useNavigate } from "react-router-dom";
import Header from '../../components/header/Header.tsx';
import Button from '../../components/button/Button.tsx';
import Footer from '../../components/footer/Footer.tsx';
import { countries } from '../../constants/countries';
import CompanyService, {type CompanyDto, type UpdateCompanyDto} from '../../services/company.service';
import './ModifyCompanyInfos.css';

interface ModifyCompanyInfosForm {
    name: string;
    contactEmail: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
}

const ModifyCompanyInfosPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [listError, setListError] = useState<string>('');
    const [formData, setFormData] = useState<ModifyCompanyInfosForm>(
        {
            name: '',
            contactEmail: '',
            streetAddress: '',
            city: '',
            postalCode: '',
            country: ''
        }
    );

    useEffect(() => {
        if (user) void fetchCompanyData();
    }, [user]);


    const fetchCompanyData = async () => {
        setLoading(true);
        setListError('');

        try {
            const data: CompanyDto = await CompanyService.getCompanyById(user!.entityId);
            setFormData({
                name: data.name ?? '',
                contactEmail: data.contactEmail ?? '',
                streetAddress: data.streetAddress ?? '',
                city: data.city ?? '',
                postalCode: data.postalCode ?? '',
                country: data.country ?? ''
            });
        } catch (error) {
            setListError('Erreur lors du chargement des informations de l\'entreprise.');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const [errors, setErrors] = useState<Partial<ModifyCompanyInfosForm>>({});
    const [modificationError, setModificationError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<ModifyCompanyInfosForm> = {};
        if (!formData.name) newErrors.name = "Le nom de l'entreprise est requis.";
        if (formData.name.length > 100) newErrors.name = "Le nom de l'entreprise ne doit pas dépasser 100 caractères.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail)) newErrors.contactEmail = "L'email n'est pas valide.";

        if (formData.streetAddress.length > 200) newErrors.streetAddress = "L'adresse ne doit pas dépasser 200 caractères.";
        if (formData.city.length > 100) newErrors.city = "La ville ne doit pas dépasser 100 caractères.";
        if (formData.postalCode.length > 20) newErrors.postalCode = "Le code postal ne doit pas dépasser 20 caractères.";
        if (formData.country.length > 100) newErrors.country = "Le pays ne doit pas dépasser 100 caractères.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const companyId = user?.entityId;
        if (!companyId) {
            setModificationError("Erreur : L'identifiant de l'entreprise n'a pas pu être récupéré.");
            return;
        }

        const updateCompanyData: UpdateCompanyDto = {
            name: formData.name,
            contactEmail: formData.contactEmail,
            streetAddress: formData.streetAddress,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country
        };

        try {
            await CompanyService.updateCompany(companyId, updateCompanyData);
            navigate('/');
        } catch (error) {
            setModificationError("Erreur lors de la mise à jour des informations de l'entreprise.");
        }
    };

    return (
        <>
            <Header/>
            <div className='modify-company-infos-container'>
                <h1 className='modify-company-infos-title'>Modifier les informations de l'entreprise</h1>

                {listError && (
                <div className="error-message inline-error">
                    {listError}
                </div>
                )}

                {loading ? (
                    <p>Chargement des informations...</p>
                ) : (
                    <form className='modify-company-infos-form' onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label>Nom de l'entreprise</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'input-error' : ''}
                            />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Email de contact</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className={errors.contactEmail ? 'input-error' : ''}
                            />
                            {errors.contactEmail && <p className="error-message">{errors.contactEmail}</p>}
                        </div>
                        <div className='form-group'>
                            <label>Adresse</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleChange}
                                className={errors.streetAddress ? 'input-error' : ''}
                            />
                            {errors.streetAddress && <p className="error-message">{errors.streetAddress}</p>}
                        </div>
                        <div className='form-group'>
                            <label>Ville</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={errors.city ? 'input-error' : ''}
                            />
                            {errors.city && <p className="error-message">{errors.city}</p>}
                        </div>
                        <div className='form-group'>
                            <label>Code Postal</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className={errors.postalCode ? 'input-error' : ''}
                            />
                            {errors.postalCode && <p className="error-message">{errors.postalCode}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="country">Pays</label>
                            <select 
                                id="country" 
                                name="country"  
                                value={formData.country}
                                onChange={handleChange}
                                >
                                <option value="" disabled>Sélectionnez un pays</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                    {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {modificationError && <p className='error-message modification-error'>{modificationError}</p>}

                        <div className='form-actions'>
                            <Link to="/" className="nav-link active">Annuler</Link>
                            <Button type="submit" variant='primary'>Modifier vos informations</Button>
                        </div>
                    </form>
                )}
            </div>
            <Footer/>
        </>
    );
}

export default ModifyCompanyInfosPage;