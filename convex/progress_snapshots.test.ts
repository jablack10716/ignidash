/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

const TEST_USER = 'test-user-123';

describe('progressSnapshots', () => {
  it('takes a snapshot of current finances', async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: TEST_USER });

    // Setup: Add some finances
    await asUser.mutation(api.finances.upsertAsset, {
      asset: { id: 'asset-1', name: 'Savings', value: 10000, type: 'savings', updatedAt: Date.now() },
    });
    await asUser.mutation(api.finances.upsertLiability, {
      liability: { id: 'debt-1', name: 'Loan', balance: 2000, type: 'personalLoan', updatedAt: Date.now() },
    });

    // Take snapshot
    const snapshotId = await asUser.mutation(api.progress_snapshots.takeSnapshot, {
      note: 'First snapshot',
    });

    // Verify snapshot
    const snapshots = await asUser.query(api.progress_snapshots.getSnapshots);
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]._id).toBe(snapshotId);
    expect(snapshots[0].netWorth).toBe(8000);
    expect(snapshots[0].note).toBe('First snapshot');
    expect(snapshots[0].assets).toHaveLength(1);
    expect(snapshots[0].liabilities).toHaveLength(1);
  });

  it('updates a snapshot', async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: TEST_USER });

    await asUser.mutation(api.finances.upsertAsset, {
      asset: { id: 'asset-1', name: 'Savings', value: 10000, type: 'savings', updatedAt: Date.now() },
    });
    const snapshotId = await asUser.mutation(api.progress_snapshots.takeSnapshot, { note: 'Old note' });

    await asUser.mutation(api.progress_snapshots.updateSnapshot, {
      id: snapshotId,
      note: 'New note',
      date: '2020-01-01',
    });

    const snapshots = await asUser.query(api.progress_snapshots.getSnapshots);
    expect(snapshots[0].note).toBe('New note');
    expect(snapshots[0].date).toBe('2020-01-01');
  });

  it('deletes a snapshot', async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: TEST_USER });

    await asUser.mutation(api.finances.upsertAsset, {
      asset: { id: 'asset-1', name: 'Savings', value: 10000, type: 'savings', updatedAt: Date.now() },
    });
    const snapshotId = await asUser.mutation(api.progress_snapshots.takeSnapshot, {});

    await asUser.mutation(api.progress_snapshots.deleteSnapshot, { id: snapshotId });

    const snapshots = await asUser.query(api.progress_snapshots.getSnapshots);
    expect(snapshots).toHaveLength(0);
  });

  it('throws error when taking snapshot with no finances', async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: TEST_USER });

    await expect(asUser.mutation(api.progress_snapshots.takeSnapshot, {})).rejects.toThrow(
      'No finances found to snapshot'
    );
  });
});
