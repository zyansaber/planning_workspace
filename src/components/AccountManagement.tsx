import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

type Account = { uid: string; email: string; disabled: boolean; createdAt: string };
type AccountAction =
  | { action: 'list' }
  | { action: 'create'; email: string; password: string }
  | { action: 'update'; uid: string; email: string; password?: string; disabled: boolean }
  | { action: 'delete'; uid: string };

const manageAccounts = httpsCallable<AccountAction, { accounts?: Account[] }>(functions, 'manageAccounts');

export function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState<Account | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [busy, setBusy] = useState(true);

  const loadAccounts = async () => {
    setBusy(true);
    try {
      const result = await manageAccounts({ action: 'list' });
      setAccounts(result.data.accounts ?? []);
    } catch {
      toast.error('Unable to load accounts. Make sure the Firebase function is deployed.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void loadAccounts(); }, []);

  const reset = () => {
    setEmail('');
    setPassword('');
    setDisabled(false);
    setEditing(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await manageAccounts({ action: 'update', uid: editing.uid, email, ...(password ? { password } : {}), disabled });
      } else {
        await manageAccounts({ action: 'create', email, password });
      }
      toast.success(editing ? 'Account updated' : 'Account created');
      reset();
      await loadAccounts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save account');
      setBusy(false);
    }
  };

  const remove = async (account: Account) => {
    if (!confirm(`Delete ${account.email}?`)) return;
    setBusy(true);
    try {
      await manageAccounts({ action: 'delete', uid: account.uid });
      toast.success('Account deleted');
      await loadAccounts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete account');
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Account access</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">Create or edit Firebase email/password accounts. Passwords are handled by Firebase Authentication and are never stored as readable text.</p>
        <form onSubmit={save} className="grid gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div><Label htmlFor="account-email">Email</Label><Input id="account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div>
          <div><Label htmlFor="account-password">{editing ? 'New password (optional)' : 'Password'}</Label><Input id="account-password" type="password" minLength={6} required={!editing} value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="flex gap-2"><Button disabled={busy} type="submit">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? 'Save' : 'Add account'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
          {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} />Disable this account</label>}
        </form>
        {busy && accounts.length === 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="divide-y rounded-lg border">
            {accounts.map((account) => <div key={account.uid} className="flex items-center justify-between gap-4 p-3"><div><p className="font-medium">{account.email}</p><p className="text-xs text-gray-500">{account.disabled ? 'Disabled' : 'Active'} · Created {new Date(account.createdAt).toLocaleDateString()}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setEditing(account); setEmail(account.email); setPassword(''); setDisabled(account.disabled); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => void remove(account)} disabled={account.email.toLowerCase() === 'yan@regentrv.com.au'}><Trash2 className="h-4 w-4" /></Button></div></div>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
