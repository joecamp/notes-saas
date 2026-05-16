import { useState } from "react";
import { login, register } from "../services/authApi";

interface Props {
  onAuthSuccess: () => void;
}

type Mode = "login" | "register";

export default function AuthPage({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password });
        await login({ email, password });
      }
      onAuthSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrors(message.split("\n"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div>
          <h1 className="app-title no-select">Noteworthy</h1>
          <p className="app-subtitle no-select">a no-nonsense notes taking app</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("login"); setErrors([]); setEmail(""); setPassword(""); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("register"); setErrors([]); setEmail(""); setPassword(""); }}
          >
            Register
          </button>
        </div>

        <form className="basic-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.length > 0 && (
            <div className="error-banner">
              {errors.length === 1 ? errors[0] : (
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <a href="https://github.com/joecamp/notes-saas" target="_blank" rel="noreferrer">About</a>
          <p>Created by Joseph Campanelli</p>
        </div>
      </div>
    </div>
  );
}
