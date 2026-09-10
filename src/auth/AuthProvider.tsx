import { auth } from '@/lib/firebase';
import {
  browserLocalPersistence,
  OAuthProvider,
  User,
  getIdTokenResult,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

const ALLOWED_DOMAIN = 'regentrv.com.au';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isAllowedMicrosoftUser(user: User) {
  const hasAllowedDomain = user.email?.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`) ?? false;
  const signedInWithMicrosoft = user.providerData.some(({ providerId }) => providerId === 'microsoft.com');

  return hasAllowedDomain && signedInWithMicrosoft;
}

function getSignInError(error: unknown, method: 'microsoft' | 'password') {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error : new Error('Unable to sign in. Please try again.');
  }

  const messages: Record<string, string> = {
    'auth/configuration-not-found': method === 'password'
      ? 'Firebase account/password sign-in is not configured. An administrator must enable the Email/Password provider.'
      : 'The planningworkspace Firebase project has no usable Microsoft provider configuration. Open Firebase Authentication → Sign-in method → Microsoft, enter the Entra client ID and client-secret value, enable it, and save. A Render environment variable cannot replace this Firebase Console setup.',
    'auth/operation-not-allowed': method === 'password'
      ? 'Account/password sign-in is disabled in Firebase. An administrator must enable the Email/Password provider.'
      : 'Microsoft sign-in is disabled in Firebase. An administrator must enable the Microsoft provider.',
    'auth/invalid-credential': method === 'password'
      ? 'The account or password is incorrect.'
      : 'Microsoft could not verify this account. Please try again.',
    'auth/unauthorized-domain':
      'This website domain is not authorized in Firebase Authentication. An administrator must add it to Authorized domains.',
    'auth/popup-blocked': 'Your browser blocked the Microsoft sign-in window. Allow pop-ups and try again.',
    'auth/popup-closed-by-user': 'The Microsoft sign-in window was closed before sign-in finished.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open. Complete it or try again.',
  };

  return new Error(messages[error.code] ?? 'Sign-in failed. Check your account details or contact your administrator.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => undefined;
    let cancelled = false;

    const restoreSession = async () => {
      await setPersistence(auth, browserLocalPersistence);

      if (cancelled) return;

      unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
        if (!nextUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const token = await getIdTokenResult(nextUser);
          const signedInWithMicrosoft = token.signInProvider === 'microsoft.com';
          const signedInWithPassword = token.signInProvider === 'password';
          const hasAllowedMicrosoftDomain = nextUser.email?.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`) ?? false;

          if (!(signedInWithPassword || (signedInWithMicrosoft && hasAllowedMicrosoftDomain))) {
            await signOut(auth);
            setUser(null);
            return;
          }

          setUser(nextUser);
        } catch {
          // Fail closed when Firebase cannot refresh and verify the persisted session.
          await signOut(auth);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
    };

    void restoreSession().catch(() => {
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async () => {
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        prompt: 'select_account',
        ...(import.meta.env.VITE_MICROSOFT_TENANT_ID
          ? { tenant: import.meta.env.VITE_MICROSOFT_TENANT_ID }
          : {}),
      });

      try {
        const result = await signInWithPopup(auth, provider);
        if (!isAllowedMicrosoftUser(result.user)) {
          await signOut(auth);
          throw new Error(`Please sign in with your @${ALLOWED_DOMAIN} Microsoft account.`);
        }
      } catch (error) {
        throw getSignInError(error, 'microsoft');
      }
    },
    signInWithPassword: async (email, password) => {
      try {
        await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      } catch (error) {
        throw getSignInError(error, 'password');
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
