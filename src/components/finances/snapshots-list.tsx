'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { formatCompactCurrency } from '@/lib/utils/number-formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import DeleteDataItemAlert from '@/components/ui/delete-data-item-alert';

interface SnapshotsListProps {
  snapshots: Doc<'progressSnapshots'>[];
}

export default function SnapshotsList({ snapshots }: SnapshotsListProps) {
  const [snapshotToDelete, setSnapshotToDelete] = useState<{ id: string; name: string } | null>(null);
  const deleteMutation = useMutation((api as any).progress_snapshots.deleteSnapshot);

  const handleDelete = async (id: string) => {
    await deleteMutation({ id: id as Id<'progressSnapshots'> });
  };

  if (snapshots.length === 0) return null;

  return (
    <div className="mt-8">
      <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Net Worth</TableHeader>
            <TableHeader className="hidden sm:table-cell">Note</TableHeader>
            <TableHeader className="relative w-0">
              <span className="sr-only">Actions</span>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {snapshots.map((snapshot) => (
            <TableRow key={snapshot._id}>
              <TableCell className="font-medium">
                {new Date(snapshot.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {formatCompactCurrency(snapshot.netWorth, 2)}
              </TableCell>
              <TableCell className="hidden text-stone-500 sm:table-cell dark:text-stone-400">
                {snapshot.note || '-'}
              </TableCell>
              <TableCell>
                <div className="-mx-3">
                  <Dropdown>
                    <DropdownButton plain aria-label="Open options">
                      <EllipsisVerticalIcon className="size-5" />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem 
                        onClick={() => setSnapshotToDelete({ 
                          id: snapshot._id, 
                          name: `Snapshot from ${new Date(snapshot.date).toLocaleDateString()}` 
                        })}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteDataItemAlert
        dataToDelete={snapshotToDelete}
        setDataToDelete={setSnapshotToDelete}
        deleteData={handleDelete}
        desc="This will permanently delete this historical snapshot."
      />
    </div>
  );
}
