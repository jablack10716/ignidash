import { z } from 'zod';

export const progressSnapshotFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
  assets: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    value: z.number(),
    type: z.string(),
  })),
  liabilities: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    balance: z.number(),
    type: z.string(),
  })),
});

export type ProgressSnapshotInputs = z.infer<typeof progressSnapshotFormSchema>;
