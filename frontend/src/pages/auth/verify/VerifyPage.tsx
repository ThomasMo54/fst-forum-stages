import "./VerifyPage.css";
import Button from "../../../components/button/Button.tsx";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import UserService, { type VerifyUserDto } from "../../../services/user.service.ts";

export function VerifyPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ error: string | null; success: string | null }>({ error: null, success: null });
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      console.warn("No email found in location state, redirecting to /register");
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResendStatus({ error: null, success: null });
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

  const handleResend = async () => {
    setResendStatus({ error: null, success: null });
    setError(null);
    if (email) {
      try {
        await UserService.refreshVerificationCode(email)
        setResendStatus({ error: null, success: 'Un nouveau code a été envoyé.' });
      } catch (err) {
        const error = err as AxiosError;
        if (error.response && error.response.status === 429) {
          setResendStatus({ success: null, error: 'Trop de demandes. Veuillez réessayer plus tard.' });
        } else {
          setResendStatus({ success: null, error: 'Une erreur est survenue lors du renvoi du code.' });
        }
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
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={handleResend} type="button">
            Renvoyer le code
          </Button>
          {resendStatus.success && <p style={{ color: 'green', marginTop: '0.5rem' }}>{resendStatus.success}</p>}
          {resendStatus.error && <p className="error-message" style={{ marginTop: '0.5rem' }}>{resendStatus.error}</p>}
        </div>
      </div>
    </div>
  );
}