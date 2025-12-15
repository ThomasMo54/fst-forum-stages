import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.tsx";
import { Link,  useNavigate } from "react-router-dom";
import type { UpdateStudentDto } from '../../services/student.service.ts';
import StudentService, { type StudentDto } from '../../services/student.service.ts';
import Header from '../../components/header/Header.tsx';
import Button from '../../components/button/Button.tsx';
import Footer from '../../components/footer/Footer.tsx';
import './ModifyStudentInfos.css';


interface ModifyStudentInfosForm {
    firstName: string;
    lastName: string;
    email: string;
    studentNumber: string;
    phone: string;
    educationLevel: string;
    fieldOfStudy: string;
    specialization: string;
    yearOfStudy: string;
    skills: string;
}

const ModifyStudentInfosPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [studentId, setStudentId] = useState<string>('');
    const [listError, setListError] = useState<string>('');
    const [formData, setFormData] = useState<ModifyStudentInfosForm>(
        {
            firstName: '',
            lastName: '',
            email: '',
            studentNumber: '',
            phone: '',
            educationLevel: '',
            fieldOfStudy: '',
            specialization: '',
            yearOfStudy: '',
            skills: '',
        }
    );

    useEffect(() => {
        if (user) void fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        setLoading(true);
        setListError('');

        try {
            const data: StudentDto = await StudentService.getStudentByUserId(user!.userId);
            setStudentId(data.id);
            setFormData({
                firstName: data.firstName ?? 'fsdfqs',
                lastName: data.lastName ?? '',
                email: data.email ?? '',
                studentNumber: data.studentNumber ?? '',
                phone: data.phone ?? '',
                educationLevel: data.educationLevel ?? '',
                fieldOfStudy: data.fieldOfStudy ?? '',
                specialization: data.specialization ?? '',
                yearOfStudy: data.yearOfStudy.toString() ?? '',
                skills: data.skills.join(', ') ?? '',
            });
        } catch (err) {
            setListError("Impossible de récupérer les informations de l'étudiant pour le moment.");
        } finally {
            setLoading(false);
        }
    }

    const navigate = useNavigate();
    
    const [errors, setErrors] = useState<Partial<ModifyStudentInfosForm>>({});
    const [modificationError, setModificationError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<ModifyStudentInfosForm> = {};
        if (!formData.firstName) newErrors.firstName = "Le prénom est requis.";
        if (formData.firstName.length > 50) newErrors.firstName = "Le prénom ne doit pas dépasser 50 caractères.";
        if (formData.firstName.length < 2) newErrors.firstName = "Le prénom doit contenir au moins 2 caractères.";

        if (!formData.lastName) newErrors.lastName = "Le nom de famille est requis.";
         if (formData.lastName.length > 50) newErrors.lastName = "Le nom de famille ne doit pas dépasser 50 caractères.";
        if (formData.lastName.length < 2) newErrors.lastName = "Le nom de famille doit contenir au moins 2 caractères.";

        if (!formData.email) newErrors.email = "L'email est requis.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = "L'email n'est pas valide.";

        if (!formData.studentNumber) newErrors.studentNumber = "Le numéro étudiant est requis.";
        const studentNumberRegex = /^[A-Z0-9]{6,20}$/;
        if (!studentNumberRegex.test(formData.studentNumber)) newErrors.studentNumber = "Le numéro étudiant n'est pas valide. (6-20 caractères alphanumériques)";

        const phoneRegex = /^(\+33|0)[1-9][0-9]{8}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = "Le numéro de téléphone n'est pas valide. (Format français attendu)";

        if (!formData.educationLevel) newErrors.educationLevel = "Le niveau d'éducation est requis.";
        if (!formData.fieldOfStudy) newErrors.fieldOfStudy = "Le domaine d'étude est requis.";
        if (!formData.yearOfStudy) newErrors.yearOfStudy = "L'année d'étude est requise.";
        if (Number.parseInt(formData.yearOfStudy) < 1 || Number.parseInt(formData.yearOfStudy) > 13) newErrors.yearOfStudy = "L'année d'étude doit être entre 1 et 13.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const userId = user?.userId;
        if (!userId) {
            setModificationError("Utilisateur non authentifié.");
            return;
        }

        const studentData: UpdateStudentDto = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            studentNumber: formData.studentNumber,
            phone: formData.phone,
            educationLevel: formData.educationLevel,
            fieldOfStudy: formData.fieldOfStudy,
            specialization: formData.specialization,
            yearOfStudy: Number.parseInt(formData.yearOfStudy),
            skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : [],
        };

        try {
            await StudentService.updateStudent(studentId, studentData);
            navigate('/');
        } catch (error) {
            setModificationError("Erreur lors de la modification des informations.");
        }
    };

    return (
        <>
            <Header/>
            <div className='modify-student-infos-container'>
                <h1 className='modify-student-infos-title'>Modifier vos informations</h1>

                {listError && (
                <div className="error-message inline-error">
                    {listError}
                </div>
                )}

                {loading ? (
                    <p>Chargement des informations...</p>
                ) :
                    <form className='modify-student-infos-form' onSubmit={handleSubmit}>

                        <div className='form-group'>
                            <label>Prénom:</label>
                            <input
                                type="text" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange}
                                className={errors.firstName ? 'input-error' : ''}
                            />
                            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Nom de famille:</label>
                            <input 
                                type="text" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange}
                                className={errors.lastName ? 'input-error' : ''}
                            />
                            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Email:</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Numéro étudiant:</label>
                            <input 
                                type="text" 
                                name="studentNumber" 
                                value={formData.studentNumber}
                                onChange={handleChange}
                                className={errors.studentNumber ? 'input-error' : ''}
                            />
                            {errors.studentNumber && <p className="error-message">{errors.studentNumber}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Téléphone:</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className='form-group'>
                            <label>Niveau d'éducation:</label>
                            <input 
                                type="text" 
                                name="educationLevel"
                                value={formData.educationLevel}
                                placeholder='Ex: Bac+3, Master...'
                                onChange={handleChange}
                                className={errors.educationLevel ? 'input-error' : ''}
                            />
                            {errors.educationLevel && <p className="error-message">{errors.educationLevel}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Domaine d'étude:</label>
                            <input 
                                type="text" 
                                name="fieldOfStudy" 
                                value={formData.fieldOfStudy} 
                                placeholder='Ex: CS, biologie...'
                                onChange={handleChange}
                                className={errors.fieldOfStudy ? 'input-error' : ''}
                            />
                            {errors.fieldOfStudy && <p className="error-message">{errors.fieldOfStudy}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Spécialisation:</label>
                            <input 
                                type="text" 
                                name="specialization" 
                                placeholder='Ex: Ingénierie logicielle, SIRAV...'
                                value={formData.specialization} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className='form-group'>
                            <label>Année d'étude:</label>
                            <input 
                                type="number" 
                                name="yearOfStudy" 
                                value={formData.yearOfStudy} 
                                onChange={handleChange}
                                className={errors.yearOfStudy ? 'input-error' : ''}
                            />
                            {errors.yearOfStudy && <p className="error-message">{errors.yearOfStudy}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Compétences (séparées par des virgules):</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                placeholder='Ex: Java, react, Spring Boot'
                                onChange={handleChange}
                            />
                        </div>

                        {modificationError && <p className="error-message modification-error">{modificationError}</p>}

                        <div className='form-actions'>
                            <Link to="/" className="nav-link active">Annuler</Link>
                            <Button type="submit" variant="primary">Modifier vos informations</Button>
                        </div>

                    </form>
                }
            </div>
            <Footer/>
        </>
    );
};

export default ModifyStudentInfosPage;