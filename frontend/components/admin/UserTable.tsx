'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/src/types';
import { Role, UserStatus } from '@/src/types/enums';
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/endpoints';
import OptimizedImage from '@/components/common/OptimizedImage';

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');

  // Mutation for updating user status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UserStatus }) => {
      const url = `${ENDPOINTS.admin.users}${userId}/`;
      const response = await apiClient.patch(url, { status });
      return response.data;
    },
    onMutate: async ({ userId, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });

      // Snapshot the previous users
      const previousUsers = queryClient.getQueryData<User[]>(['adminUsers']);

      // Optimistically update the list in the cache
      if (previousUsers) {
        queryClient.setQueryData<User[]>(
          ['adminUsers'],
          previousUsers.map((u) => (u.id === userId ? { ...u, status } : u))
        );
      }

      // Return context with snapshotted values for rollback
      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      // Revert back to original state if mutation fails
      if (context?.previousUsers) {
        queryClient.setQueryData(['adminUsers'], context.previousUsers);
      }
    },
    onSettled: () => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const handleStatusChange = useCallback((userId: string, newStatus: UserStatus) => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  }, [updateStatusMutation]);

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => (
          <span className="text-[11px] font-mono text-gray-400 font-medium">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'Foydalanuvchi',
        accessorFn: (row) => `${row.first_name} ${row.last_name || ''}`.trim(),
        cell: (info) => {
          const row = info.row.original;
          const fullName = `${row.first_name} ${row.last_name || ''}`.trim();
          const initials = `${row.first_name[0] || ''}${row.last_name ? row.last_name[0] : ''}`.toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-inner">
                {row.avatar ? (
                  <OptimizedImage src={row.avatar} alt={fullName} width={32} height={32} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-gray-900 leading-none">{fullName}</p>
                <p className="text-[10px] text-gray-400 font-semibold leading-none">@{row.username}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => (
          <span className="text-xs text-gray-500 font-medium">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: (info) => {
          const val = info.getValue() as Role;
          let color = 'bg-gray-100 text-gray-700 border-gray-200';
          if (val === Role.SUPER_ADMIN) {
            color = 'bg-rose-50 text-rose-700 border-rose-100';
          } else if (val === Role.PROVIDER) {
            color = 'bg-amber-50 text-amber-700 border-amber-100';
          }
          return (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${color}`}>
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Holat',
        cell: (info) => {
          const val = info.getValue() as UserStatus;
          let color = 'bg-green-50 text-green-700 border-green-150';
          if (val === UserStatus.FROZEN) {
            color = 'bg-sky-50 text-sky-700 border-sky-100';
          } else if (val === UserStatus.BLOCKED) {
            color = 'bg-rose-50 text-rose-700 border-rose-100';
          } else if (val === UserStatus.DELETED) {
            color = 'bg-gray-100 text-gray-400 border-gray-200';
          }
          return (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${color}`}>
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Qo\'shilgan sana',
        cell: (info) => (
          <span className="text-xs text-gray-400 font-semibold">
            {new Date(String(info.getValue())).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Amallar',
        cell: (info) => {
          const row = info.row.original;
          const status = row.status;
          if (row.role === Role.SUPER_ADMIN) return null; // Can't block/freeze another Super Admin here

          return (
            <div className="flex gap-1.5">
              {status === UserStatus.ACTIVE && (
                <>
                  <button
                    onClick={() => handleStatusChange(row.id, UserStatus.FROZEN)}
                    className="px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Freeze
                  </button>
                  <button
                    onClick={() => handleStatusChange(row.id, UserStatus.BLOCKED)}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Block
                  </button>
                </>
              )}
              {(status === UserStatus.FROZEN || status === UserStatus.BLOCKED) && (
                <button
                  onClick={() => handleStatusChange(row.id, UserStatus.ACTIVE)}
                  className="px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Activate
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, value) => {
      const search = String(value).toLowerCase();
      if (!search) return true;
      const firstName = String(row.getValue('name') || '').toLowerCase();
      const email = String(row.getValue('email') || '').toLowerCase();
      const username = String(row.original.username || '').toLowerCase();
      return firstName.includes(search) || email.includes(search) || username.includes(search);
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Input Filter */}
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Ism, email yoki username bo'yicha qidirish..."
            className="w-full bg-gray-55 border border-gray-150 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-xs text-gray-400 font-semibold">
          Jami: <span className="text-gray-900 font-extrabold">{users.length} ta</span> foydalanuvchi
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400 select-none"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm font-semibold text-gray-400"
                  >
                    Hech qanday foydalanuvchi topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
