import assert from 'node:assert/strict';
import { configuration } from '../src/config.js';
import { openDatabase } from '../src/db.js';
import { Repository } from '../src/repository.js';
import { createAuth } from '../src/auth.js';

const config = configuration();
const db = await openDatabase(config);
const repo = new Repository(db);
const origin = 'http://127.0.0.1:8080';
let token;
try {
  let message;
  await createAuth({ db, repo, config, mail: { send: async value => { message = value; } } }).requestLink('info@aniprotech.com');
  const link = message.text.match(/http[^\s]+/)[0];
  const [email, password] = Buffer.from(new URL(link).searchParams.get('token'), 'base64url').toString().split(':');
  const login = await fetch(`${origin}/api/auth/get-token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(login.status, 200);
  token = (await login.json()).results.data.accessToken;
  assert.ok(token);
  const headers = { Authorization: `Bearer ${token}` };
  const submit = async fields => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.append(key, value);
    const response = await fetch(`${origin}/api/client/create`, { method: 'POST', headers, body });
    return { status: response.status, body: await response.json() };
  };
  const base = { firstName: 'Dummy', lastName: 'Client', title: 'MR', dateOfBirth: '1950-01-01', referredAs: 'HE_HIM', primaryPhone: '', primaryPhoneCode: '+44', primaryPhoneType: '', secondaryPhone: '', secondaryPhoneCode: '+44', secondaryPhoneType: '', role: 'USER', filesToRemove: '[]', addresses: JSON.stringify([{ addressType: 'MAIN_BUSINESS_PREMISES', addressLine1: 'Dummy address - testing only', city: 'London', country: 'United Kingdom', secureCheckin: false, isPrimary: true }]), highlights: 'DUMMY TEST RECORD ONLY. Not a real person. Created to verify client creation.' };
  const invalid = await submit({ ...base, email: '' });
  assert.equal(invalid.status, 400);
  console.log('Reproduced missing-email rejection:', invalid.body.message);
  const invalidType = await submit({ ...base, email: 'dummy.client@example.test', primaryPhoneType: 'OLD' });
  assert.equal(invalidType.status, 400);
  console.log('Reproduced unsupported-phone-type rejection:', invalidType.body.message);
  let dummy = await repo.one('UserEntity', { email: 'dummy.client@example.test' });
  if (!dummy) {
    const created = await submit({ ...base, email: 'dummy.client@example.test' });
    assert.equal(created.status, 200, created.body.message);
    dummy = await repo.one('UserEntity', { email: 'dummy.client@example.test' });
    console.log('Created one dummy client.');
  } else console.log('Existing dummy client reused; no duplicate created.');
  assert.ok(dummy);
  const detail = await fetch(`${origin}/api/client/get-client/${dummy.id}`, { headers });
  assert.equal(detail.status, 200);
  const list = await fetch(`${origin}/api/client/get-all-clients`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 1, size: 20, search: 'dummy.client@example.test' }) });
  assert.equal(list.status, 200);
  const data = (await list.json()).results.data;
  assert.ok(data.users.some(user => user.id === dummy.id));
  console.log('Verified client detail and client list: Dummy Client (dummy.client@example.test).');
} finally {
  if (token) await fetch(`${origin}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  await db.close();
}
