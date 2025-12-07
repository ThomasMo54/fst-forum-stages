import "./VerifyPage.css";
import Button from "../../../components/button/Button.tsx";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserService, { type VerifyUserDto } from '../../../services/user.service';

export function VerifyPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (email) {
      const verifyData: VerifyUserDto = {
        email,
        verificationCode: code
      }
      try {
        await UserService.verifyUser(verifyData);
        navigate('/login');
      } catch (err) {
        setError("Code de vérification invalide ou expiré.");
      }
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h1>Vérification du compte</h1>
        <p>Un email de vérification a été envoyé à <strong>{email}</strong>. Veuillez entrer le code à 6 chiffres reçu.</p>
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="code">Code de vérification</label>
            <input
              type="text"
              id="code"
              name="code"
              maxLength={6}
              minLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <Button type="submit">
            Vérifier
          </Button>
        </form>
      </div>
    </div>
  );
}
