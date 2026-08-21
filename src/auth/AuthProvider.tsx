import { auth } from '@/lib/firebase';
import {
  OAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

const ALLOWED_DOMAIN = 'regentrv.com.au';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (nextUser && !hasAllowedDomain(nextUser)) {
      await signOut(auth);
      setUser(null);
    } else {
      setUser(nextUser);
    }
    setLoading(false);
  }), []);

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

      const result = await signInWithPopup(auth, provider);
      if (!hasAllowedDomain(result.user)) {
        await signOut(auth);
        throw new Error(`Please sign in with your @${ALLOWED_DOMAIN} Microsoft account.`);
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
