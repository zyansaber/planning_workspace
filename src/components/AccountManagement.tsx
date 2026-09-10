import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { database } from '@/lib/firebase';
import { deletePasswordAccount, PasswordAccount, savePasswordAccount } from '@/auth/passwordAccounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function AccountManagement() {
  const [accounts, setAccounts] = useState<PasswordAccount[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState<PasswordAccount | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [busy, setBusy] = useState(true);

  const loadAccounts = async () => {
    setBusy(true);
    try {
      const snapshot = await get(ref(database, 'passwordUsers'));
      setAccounts(snapshot.exists() ? Object.values(snapshot.val() as Record<string, PasswordAccount>) : []);
    } catch {
      toast.error('Unable to load password accounts. Deploy database.rules.json and sign in as yan@regentrv.com.au.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void loadAccounts(); }, []);

  const reset = () => { setEmail(''); setPassword(''); setDisabled(false); setEditing(null); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await savePasswordAccount(email, password, editing?.email, disabled);
      toast.success(editing ? 'Account updated' : 'Account created');
      reset();
      await loadAccounts();
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown database error';
      toast.error(`Unable to save account: ${detail}. Check the deployed Realtime Database rules.`);
      setBusy(false);
    }
  };

  const remove = async (account: PasswordAccount) => {
    if (!confirm(`Delete ${account.email}?`)) return;
    setBusy(true);
    try {
      await deletePasswordAccount(account.email);
      toast.success('Account deleted');
      await loadAccounts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete account');
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Password accounts</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">These non-Microsoft accounts are stored in Realtime Database. Passwords are saved only as salted PBKDF2 hashes, never as readable text.</p>
        <form onSubmit={save} className="grid gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div><Label htmlFor="account-email">Email</Label><Input id="account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div>
          <div><Label htmlFor="account-password">{editing ? 'New password (optional)' : 'Password'}</Label><Input id="account-password" type="password" minLength={8} required={!editing} value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="flex gap-2"><Button disabled={busy} type="submit">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? 'Save' : 'Add account'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
          {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} />Disable this account</label>}
        </form>
        {busy && accounts.length === 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="divide-y rounded-lg border">
          {accounts.map((account) => <div key={account.email} className="flex items-center justify-between gap-4 p-3"><div><p className="font-medium">{account.email}</p><p className="text-xs text-gray-500">{account.disabled ? 'Disabled' : 'Active'} · Created {new Date(account.createdAt).toLocaleDateString()}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setEditing(account); setEmail(account.email); setPassword(''); setDisabled(account.disabled); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => void remove(account)}><Trash2 className="h-4 w-4" /></Button></div></div>)}
        </div>}
      </CardContent>
    </Card>
  );
}
