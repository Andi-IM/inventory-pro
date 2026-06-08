import { SignJWT, jwtVerify } from 'jose';

export interface AuthState {
  role: string;
  permissions: string[];
  flags: Record<string, boolean>;
}

// Ensure secret is long enough. NEON_AUTH_COOKIE_SECRET is base64 encoded typically, 
// so we'll just use it directly or fallback to a default (only for dev, but it should exist).
const getSecret = () => {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || 'fallback-secret-for-development-only-replace-this';
  return new TextEncoder().encode(secret);
};

export async function signAuthState(payload: AuthState): Promise<string> {
  const alg = 'HS256';
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
  
  return jwt;
}

export async function verifyAuthState(token: string): Promise<AuthState | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      role: payload.role as string,
      permissions: payload.permissions as string[],
      flags: payload.flags as Record<string, boolean>,
    };
  } catch {
    // Token expired or invalid signature
    return null;
  }
}
