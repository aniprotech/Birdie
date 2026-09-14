// columns.js
import { createColumnHelper } from '@tanstack/react-table';
import { Check } from 'lucide-react';
import { getInitials } from '../../utils/common';
import ActionMenu from '../../pages/Teams/ViewTeams/Clients/ActionMenu';

const columnHelper = createColumnHelper();

export const getColumns = (selectedIds, toggleRow, allSelected, toggleAll) => [
  // Checkbox column
  columnHelper.display({
    id: 'select',
    header: () => (
      <input
        type="checkbox"
        checked={allSelected}
        onChange={toggleAll}
        className="w-3.5 h-3.5 accent-cyan-700 cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(row.original.id)}
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleRow(row.original.id)}
        className="w-3.5 h-3.5 accent-cyan-700 cursor-pointer"
      />
    ),
  }),

  // Care recipient column with avatar
  columnHelper.accessor('name', {
    header: 'Care recipient',
    cell: (info) => {
      const name = info.getValue();
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
            {getInitials(name)}
          </div>
          <span className="text-sm font-medium text-gray-900">{name}</span>
        </div>
      );
    },
  }),

  // Status badge
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        {info.getValue()}
      </span>
    ),
  }),

  // Roles column
  columnHelper.accessor('role', {
    header: 'Roles',
    cell: (info) => {
      const val = info.getValue();
      return val ? (
        <div className="inline-flex items-center gap-1 rounded border bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
          <Check className="h-3 w-3 text-gray-500" />
          {val}
        </div>
      ) : (
        <span className="text-xs text-gray-500">Not set</span>
      );
    },
  }),

  // Actions column
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <ActionMenu rowId={row.original.id} />,
    enableSorting: false,
  }),
];
