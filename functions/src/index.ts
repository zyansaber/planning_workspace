import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const ADMIN_EMAIL = 'yan@regentrv.com.au';

export const manageAccounts = onCall(async (request) => {
  const callerEmail = request.auth?.token.email?.toString().toLowerCase();
  if (callerEmail !== ADMIN_EMAIL) {
    throw new HttpsError('permission-denied', 'Only yan@regentrv.com.au can manage accounts.');
  }

  const data = request.data as Record<string, unknown>;
  const action = data.action;
  const auth = getAuth();
  if (action === 'list') {
    const result = await auth.listUsers(1000);
    return { accounts: result.users.filter((user) => user.providerData.some((item) => item.providerId === 'password')).map((user) => ({ uid: user.uid, email: user.email ?? '', disabled: user.disabled, createdAt: user.metadata.creationTime })) };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if ((action === 'create' || action === 'update') && !email.includes('@')) {
    throw new HttpsError('invalid-argument', 'A valid email address is required.');
  }
  if (action === 'create') {
    if (typeof data.password !== 'string' || data.password.length < 6) throw new HttpsError('invalid-argument', 'Password must contain at least 6 characters.');
    await auth.createUser({ email, password: data.password, emailVerified: true });
    return { ok: true };
  }

  const uid = typeof data.uid === 'string' ? data.uid : '';
  if (!uid) throw new HttpsError('invalid-argument', 'An account ID is required.');
  const target = await auth.getUser(uid);
  if (target.email?.toLowerCase() === ADMIN_EMAIL) throw new HttpsError('failed-precondition', 'The administrator account cannot be changed here.');
  if (action === 'update') {
    const password = typeof data.password === 'string' && data.password ? data.password : undefined;
    if (password && password.length < 6) throw new HttpsError('invalid-argument', 'Password must contain at least 6 characters.');
    await auth.updateUser(uid, { email, ...(password ? { password } : {}), disabled: data.disabled === true });
    await auth.revokeRefreshTokens(uid);
    return { ok: true };
  }
  if (action === 'delete') {
    await auth.deleteUser(uid);
    return { ok: true };
  }
  throw new HttpsError('invalid-argument', 'Unknown account action.');
});
