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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Notes</h1>

      <div style={{ display: "flex", marginBottom: "1.5rem" }}>
        <button
          onClick={() => { setMode("login"); setError(null); }}
          style={{ flex: 1, padding: "0.5rem", fontWeight: mode === "login" ? "bold" : "normal" }}
        >
          Login
        </button>
        <button
          onClick={() => { setMode("register"); setError(null); }}
          style={{ flex: 1, padding: "0.5rem", fontWeight: mode === "register" ? "bold" : "normal" }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
}
