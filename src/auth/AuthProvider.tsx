import { auth } from '@/lib/firebase';
import {
  OAuthProvider,
  User,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

const ALLOWED_DOMAIN = 'regentrv.com.au';
const REAUTHENTICATION_INTERVAL_MS = 24 * 60 * 60 * 1000;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasAllowedDomain(user: User) {
  return user.email?.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`) ?? false;
}

function getSignInError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error : new Error('Unable to sign in. Please try again.');
  }

  const messages: Record<string, string> = {
    'auth/configuration-not-found':
      'The planningworkspace Firebase project has no usable Microsoft provider configuration. Open Firebase Authentication → Sign-in method → Microsoft, enter the Entra client ID and client-secret value, enable it, and save. A Render environment variable cannot replace this Firebase Console setup.',
    'auth/operation-not-allowed':
      'Microsoft sign-in is disabled in Firebase. An administrator must enable the Microsoft provider.',
    'auth/unauthorized-domain':
      'This website domain is not authorized in Firebase Authentication. An administrator must add it to Authorized domains.',
    'auth/popup-blocked': 'Your browser blocked the Microsoft sign-in window. Allow pop-ups and try again.',
    'auth/popup-closed-by-user': 'The Microsoft sign-in window was closed before sign-in finished.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open. Complete it or try again.',
  };

  return new Error(messages[error.code] ?? 'Microsoft sign-in failed. Please try again or contact your administrator.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let expirationTimer: number | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      window.clearTimeout(expirationTimer);

      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { authTime } = await getIdTokenResult(nextUser);
        const authenticatedAt = Date.parse(authTime);
        const remainingSessionTime = authenticatedAt + REAUTHENTICATION_INTERVAL_MS - Date.now();

        if (!hasAllowedDomain(nextUser) || !Number.isFinite(authenticatedAt) || remainingSessionTime <= 0) {
          await signOut(auth);
          setUser(null);
          return;
        }

        setUser(nextUser);
        expirationTimer = window.setTimeout(() => {
          void signOut(auth);
        }, remainingSessionTime);
      } catch {
        // Fail closed when the signed authentication time cannot be verified.
        await signOut(auth);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      window.clearTimeout(expirationTimer);
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async () => {
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        prompt: 'login',
        ...(import.meta.env.VITE_MICROSOFT_TENANT_ID
          ? { tenant: import.meta.env.VITE_MICROSOFT_TENANT_ID }
          : {}),
      });

      try {
        const result = await signInWithPopup(auth, provider);
        if (!hasAllowedDomain(result.user)) {
          await signOut(auth);
          throw new Error(`Please sign in with your @${ALLOWED_DOMAIN} Microsoft account.`);
        }
      } catch (error) {
        throw getSignInError(error);
      }
    },
    logOut: () => signOut(auth),
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export { ALLOWED_DOMAIN };
