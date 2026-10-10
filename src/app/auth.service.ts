import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

interface AccountRecord {
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
}

export interface AuthUser {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accountsKey = 'fieldnote.accounts';
  private readonly sessionKey = 'fieldnote.session';
  private accounts = this.readAccounts();
  readonly currentUser = signal<AuthUser | null>(this.readSession());

  async register(name: string, email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const account: AccountRecord = {
      name: name.trim(),
      email: normalizedEmail,
      salt: this.toHex(salt),
      passwordHash: await this.hashPassword(password, salt),
    };
    this.accounts = [...this.accounts, account];
    this.saveAccounts();
  }

  async login(email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accounts.find((entry) => entry.email === normalizedEmail);
    if (!account) throw new Error('We could not find an account with those details.');

    const passwordHash = await this.hashPassword(password, this.fromHex(account.salt));
    if (passwordHash !== account.passwordHash) throw new Error('That password does not match this account.');
console.log(passwordHash, 'Login successful for user:', account.name, account.email);
    const user = { name: account.name, email: account.email };
    this.currentUser.set(user);
    sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(this.sessionKey);
    console.log('User logged out successfully.', this.accounts);
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const saltBuffer = new ArrayBuffer(salt.byteLength);
    new Uint8Array(saltBuffer).set(salt);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBuffer, iterations: 120_000, hash: 'SHA-256' }, key, 256,
    );
    return this.toHex(new Uint8Array(bits));
  }

  private readAccounts(): AccountRecord[] {
    try {
      const stored = localStorage.getItem(this.accountsKey);
      return stored ? (JSON.parse(stored) as AccountRecord[]) : [];
    } catch {
      return [];
    }
  }

  private readSession(): AuthUser | null {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private saveAccounts(): void {
    localStorage.setItem(this.accountsKey, JSON.stringify(this.accounts));
  }

  private toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private fromHex(value: string): Uint8Array {
    return new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser() ? true : router.createUrlTree(['/login']);
};