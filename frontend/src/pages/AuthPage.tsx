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
        <h1 className="app-title no-select">Noteworthy</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("login"); setErrors([]); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("register"); setErrors([]); }}
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
      </div>
    </div>
  );
}
