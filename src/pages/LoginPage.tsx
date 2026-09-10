import { ALLOWED_DOMAIN, useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

function MicrosoftMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-[2px]" aria-hidden="true">
      <span className="bg-[#f25022]" /><span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" /><span className="bg-[#ffb900]" />
    </span>
  );
}

export default function LoginPage() {
  const { user, loading, signIn, signInWithPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signIn();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.32),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_38%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Regent RV</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Sign in to Workspace</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with your approved company account. This browser will remember you and securely verify your session on future visits.
        </p>

        <Button
          className="mt-8 h-12 w-full gap-3 bg-slate-950 text-base hover:bg-slate-800"
          disabled={submitting || loading}
          onClick={handleSignIn}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MicrosoftMark />}
          Continue with Microsoft
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4" onSubmit={handlePasswordSignIn}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">Account email</label>
            <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Account registered in Firebase" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <Button type="submit" variant="outline" className="h-11 w-full" disabled={submitting || loading}>Sign in with account</Button>
        </form>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-500">
          Microsoft sign-in requires an <strong className="font-semibold text-slate-700">@{ALLOWED_DOMAIN}</strong> account. Other password accounts are managed in Workspace Settings.
        </div>
      </section>
    </main>
  );
}
