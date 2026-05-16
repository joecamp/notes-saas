import { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "auth_token";
const EMAIL_KEY = "auth_email";

const IDENTITY_ERRORS: Record<string, string> = {
  DuplicateUserName:                "An account with this email already exists.",
  DuplicateEmail:                   "An account with this email already exists.",
  PasswordTooShort:                 "Password must be at least 6 characters.",
  PasswordRequiresDigit:            "Password must contain at least one number.",
  PasswordRequiresUpper:            "Password must contain at least one uppercase letter.",
  PasswordRequiresLower:            "Password must contain at least one lowercase letter.",
  PasswordRequiresNonAlphanumeric:  "Password must contain at least one symbol (!@#$ etc).",
  PasswordRequiresUniqueChars:      "Password must contain more unique characters.",
};

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
    let message = "Invalid email or password.";
    try {
      const body = await response.json();
      if (body.message) message = body.message.trim();
    } catch { /* response wasn't JSON */ }
    throw new Error(message);
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
    let messages = ["Registration failed. Please try again."];
    try {
      const errors: { code: string; description: string }[] = await response.json();
      if (Array.isArray(errors)) {
        messages = errors.map(e => IDENTITY_ERRORS[e.code] ?? e.description);
      }
    } catch { /* response wasn't JSON */ }
    throw new Error(messages.join("\n"));
  }
}
