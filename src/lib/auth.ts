import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "shira_admin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn("ADMIN_PASSWORD not set, using default (insecure)");
    return "admin123";
  }
  return password;
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return false;
  }

  return authCookie.value === generateToken(getAdminPassword());
}

export function generateToken(password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "shira_salt_2025");
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  return hash.toString(36);
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, generateToken(getAdminPassword()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function validatePassword(password: string): boolean {
  return password === getAdminPassword();
}

export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const isAuthenticated = checkAuthFromRequest(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}

function checkAuthFromRequest(request: NextRequest): boolean {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return false;
  }

  return authCookie.value === generateToken(getAdminPassword());
}
