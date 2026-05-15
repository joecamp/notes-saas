import { useState } from "react";
import { getToken, clearToken } from "./services/authApi";
import AuthPage from "./pages/AuthPage";
import NotesPage from "./pages/NotesPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getToken() !== null);

  function handleAuthSuccess() {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    clearToken();
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <NotesPage onLogout={handleLogout} />;
}
