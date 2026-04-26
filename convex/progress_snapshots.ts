import { v, ConvexError } from 'convex/values';
import { query, mutation } from './_generated/server';

import { getUserIdOrThrow } from './utils/auth_utils';
import { getFinancesForUser } from './utils/finances_utils';
import { assetValidator } from './validators/asset_validator';
import { liabilityValidator } from './validators/liability_validator';

export const getSnapshots = query({
  handler: async (ctx) => {
    const { userId } = await getUserIdOrThrow(ctx);

    const snapshots = await ctx.db
      .query('progressSnapshots')
      .withIndex('by_userId_date', (q) => q.eq('userId', userId))
      .order('asc')
      .collect();

    return snapshots;
  },
});

export const takeSnapshot = mutation({
  args: {
    date: v.optional(v.string()), // ISO date string
    note: v.optional(v.string()),
  },
  handler: async (ctx, { date, note }) => {
    const { userId } = await getUserIdOrThrow(ctx);

    const finances = await getFinancesForUser(ctx, userId);
    if (!finances) {
      throw new ConvexError('No finances found to snapshot. Please add assets or liabilities first.');
    }

    const netWorth =
      finances.assets.reduce((sum, a) => sum + a.value, 0) -
      finances.liabilities.reduce((sum, l) => sum + l.balance, 0);

    const snapshotDate = date ?? new Date().toISOString().split('T')[0];

    const snapshotId = await ctx.db.insert('progressSnapshots', {
      userId,
      date: snapshotDate,
      netWorth,
      assets: finances.assets,
      liabilities: finances.liabilities,
      note,
    });

    return snapshotId;
  },
});

export const updateSnapshot = mutation({
  args: {
    id: v.id('progressSnapshots'),
    date: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, date, note }) => {
    const { userId } = await getUserIdOrThrow(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError('Snapshot not found or access denied.');
    }

    const patch: Partial<typeof existing> = {};
    if (date !== undefined) patch.date = date;
    if (note !== undefined) patch.note = note;

    await ctx.db.patch(id, patch);
  },
});

export const deleteSnapshot = mutation({
  args: {
    id: v.id('progressSnapshots'),
  },
  handler: async (ctx, { id }) => {
    const { userId } = await getUserIdOrThrow(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError('Snapshot not found or access denied.');
    }

    await ctx.db.delete(id);
  },
});

export const createManualSnapshot = mutation({
  args: {
    date: v.string(),
    note: v.optional(v.string()),
    assets: v.optional(v.array(assetValidator)),
    liabilities: v.optional(v.array(liabilityValidator)),
  },
  handler: async (ctx, { date, note, assets, liabilities }) => {
    const { userId } = await getUserIdOrThrow(ctx);

    const netWorth =
      (assets?.reduce((sum, a) => sum + a.value, 0) ?? 0) -
      (liabilities?.reduce((sum, l) => sum + l.balance, 0) ?? 0);

    const snapshotId = await ctx.db.insert('progressSnapshots', {
      userId,
      date,
      netWorth,
      note,
      assets,
      liabilities,
    });

    return snapshotId;
  },
});
