import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

const SERVICE_NAME = 'FleetCheck Lite Drive';

export interface TotpSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export async function generateTotpSetup(userEmail: string): Promise<TotpSetupResult> {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(userEmail, SERVICE_NAME, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  
  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl
  };
}

export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}
