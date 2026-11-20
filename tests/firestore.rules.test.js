import { readFile } from 'node:fs/promises';
import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

const projectId = 'demo-bariwala-kemon';
let testEnv;

const approvedReview = {
  status: 'approved',
  ownerUid: 'review-owner',
  houseName: 'Test House',
};

const pendingReview = {
  status: 'pending',
  ownerUid: 'review-owner',
  houseName: 'Pending House',
};

const report = (uid = 'reporter-1', overrides = {}) => ({
  reason: 'personal_info',
  details: 'Please review this content.',
  reporterUid: uid,
  status: 'pending',
  createdAt: Timestamp.now(),
  ...overrides,
});

const reportRef = (reviewId = 'approved-review', uid = 'reporter-1') =>
  doc(testEnv.authenticatedContext(uid).firestore(), 'reviews', reviewId, 'reports', uid);

before(async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'reviews', 'approved-review'), approvedReview);
    await setDoc(doc(db, 'reviews', 'pending-review'), pendingReview);
    await setDoc(doc(db, 'admins', 'admin-1'), { role: 'admin' });
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test('unauthenticated visitors cannot create reports', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(
    doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1'),
    report(),
  ));
});

test('a visitor cannot create a report under another UID path', async () => {
  const db = testEnv.authenticatedContext('visitor-1').firestore();
  await assertFails(setDoc(
    doc(db, 'reviews', 'approved-review', 'reports', 'someone-else'),
    report('visitor-1'),
  ));
});

test('reports can only be created for approved reviews', async () => {
  const db = testEnv.authenticatedContext('reporter-1').firestore();
  await assertFails(setDoc(
    doc(db, 'reviews', 'pending-review', 'reports', 'reporter-1'),
    report(),
  ));
});

test('a signed-in visitor can create one valid report for an approved review', async () => {
  await assertSucceeds(setDoc(reportRef(), report()));
});

test('a visitor cannot overwrite an existing report at the same UID path', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  await assertFails(setDoc(reportRef(), report('reporter-1', { details: 'Changed' })));
});

test('non-admin users cannot read private reports', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('ordinary-user').firestore();
  await assertFails(getDoc(doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1')));
});

test('admins can read private reports', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('admin-1').firestore();
  await assertSucceeds(getDoc(doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1')));
});

test('non-admin users cannot change report status', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('ordinary-user').firestore();
  await assertFails(updateDoc(
    doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1'),
    { status: 'reviewed' },
  ));
});

test('admins can mark a pending report reviewed or dismissed', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('admin-1').firestore();
  await assertSucceeds(updateDoc(
    doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1'),
    { status: 'reviewed' },
  ));
});

test('admins cannot change report fields other than status', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('admin-1').firestore();
  await assertFails(updateDoc(
    doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1'),
    { status: 'dismissed', details: 'Tampered' },
  ));
});

test('reports cannot be deleted, including by admins', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews', 'approved-review', 'reports', 'reporter-1'),
      report(),
    );
  });
  const db = testEnv.authenticatedContext('admin-1').firestore();
  await assertFails(deleteDoc(doc(db, 'reviews', 'approved-review', 'reports', 'reporter-1')));
});
