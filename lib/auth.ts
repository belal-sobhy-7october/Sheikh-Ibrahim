import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

let SESSION_SECRET: string | null = null;
let ADMIN_PASSWORD: string | null = null;

function getSessionSecret(): string {
  if (!SESSION_SECRET) {
    SESSION_SECRET = process.env.SESSION_SECRET || null;
    if (!SESSION_SECRET) {
      throw new Error('SESSION_SECRET is required. Set it in your environment variables.');
    }
  }
  return SESSION_SECRET;
}

function getAdminPassword(): string {
  if (!ADMIN_PASSWORD) {
    ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
    if (!ADMIN_PASSWORD) {
      throw new Error('ADMIN_PASSWORD is required. Set it in your environment variables.');
    }
  }
  return ADMIN_PASSWORD;
}

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
    }
    if (now > record.lockedUntil) {
      failedAttempts.delete(ip);
    }
  }
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 60 * 1000;
    record.count = 0;
  }

  failedAttempts.set(ip, record);
}

export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

export function createSessionToken(): string {
  const payload = {
    exp: Date.now() + TOKEN_EXPIRY_MS,
    iat: Date.now(),
    nonce: randomBytes(16).toString('hex'),
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSessionSecret()).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; expired?: boolean } {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) {
      return { valid: false };
    }

    const expectedSignature = createHmac('sha256', getSessionSecret()).update(payloadStr).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));

    if (payload.exp && payload.exp < Date.now()) {
      return { valid: false, expired: true };
    }

    return { valid: true };
  } catch {
    return { valid: false };
  }
}

export function verifyPassword(password: string): boolean {
  const passwordBuf = Buffer.from(password);
  const adminPasswordBuf = Buffer.from(getAdminPassword());

  if (passwordBuf.length !== adminPasswordBuf.length) {
    return false;
  }

  return timingSafeEqual(passwordBuf, adminPasswordBuf);
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24,
    path: '/',
  };
}

export const AUTH_COOKIE_NAME = 'admin_session';