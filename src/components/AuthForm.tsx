import { useState } from "react";
import "../styles/AuthForm.css";

function AuthForm({
  title,
  buttonText,
  onSubmit,
  isSignup,
}: {
  title: string;
  buttonText: string;
  onSubmit: (formData: any) => void;
  isSignup: boolean;
}) {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    username: "",
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const displayUsernameField = () => {
    if (isSignup) {
      return (
        <div>
          <label className="auth-label">Nom d'utilisateur</label>
          <input
            className="auth-input"
            type="text"
            autoComplete=""
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <br />
          <br />
        </div>
      );
    }
  };
  return (
    <div className="auth-container mt-20">
      <div className="auth-form">
        <h1 className="auth-title">{title}</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="auth-label">Identifiant</label>
            <input
              className="auth-input"
              type="text"
              autoComplete="username"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          {displayUsernameField()}
          <div>
            <label className="auth-label">Mot de passe</label>
            <input
              className="auth-input"
              type="password"
              autoComplete="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <br />
          </div>

          <div>
            <button type="submit" className="auth-button">
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;
