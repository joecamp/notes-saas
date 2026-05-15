import { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth";

const API_BASE = "http://localhost:5073/api";

const TOKEN_KEY = "auth_token";
const EMAIL_KEY = "auth_email";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

function saveEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email);
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Login failed ${response.status}: ${message}`);
  }

  const data: AuthResponse = await response.json();
  saveToken(data.token);
  saveEmail(data.email);
  return data;
}

export async function register(request: RegisterRequest): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Registration failed ${response.status}: ${message}`);
  }
}
