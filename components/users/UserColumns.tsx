import { ColumnDef } from '@tanstack/react-table';
import { IUser, UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, UserX, UserCheck, Key } from 'lucide-react';
import React from 'react';

interface UserColumnProps {
	onEdit: (user: IUser) => void;
	onToggleActive: (user: IUser) => void;
	getRoleBadge: (role: UserRole) => React.ReactNode;
	onChangePassword: (user: IUser) => void;
}

export const getUserColumns = ({
	onEdit,
	onToggleActive,
	getRoleBadge,
	onChangePassword,
}: UserColumnProps): ColumnDef<IUser>[] => [
		{
			accessorKey: 'name',
			header: 'Usuario',
			enableSorting: true,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
							<span className="text-white font-semibold">
								{user.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div>
							<p className="font-bold text-slate-950 dark:text-white tracking-tight">{user.name}</p>
							<p className="text-xs text-slate-500">{user.email}</p>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: 'role',
			header: 'Rol',
			enableSorting: true,
			cell: ({ row }) => getRoleBadge(row.original.role),
		},
		{
			accessorKey: 'isActive',
			header: 'Estado',
			cell: ({ row }) => {
				const active = row.original.isActive;
				return (
					<Badge
						variant="outline"
						className={`font-bold transition-all ${active
							? 'bg-green-500/10 text-green-400 border-green-500/20'
							: 'bg-red-500/10 text-red-400 border-red-500/20'
							}`}
					>
						{active ? 'Activo' : 'Inactivo'}
					</Badge>
				);
			},
		},
		{
			accessorKey: 'phone',
			header: 'Teléfono',
			cell: ({ row }) => (
				<span className="text-slate-400 font-medium">
					{row.original.phone || '-'}
				</span>
			),
		},
		{
			id: 'actions',
			header: () => <div className="text-right">Acciones</div>,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex items-center justify-end gap-2 text-right">
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onEdit(user);
							}}
							size="sm"
							variant="ghost"
							className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
						>
							<Pencil className="w-4 h-4" />
							<span className="sr-only">Editar</span>
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onChangePassword(user);
							}}
							size="sm"
							variant="ghost"
							className="h-9 w-9 p-0 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 dark:hover:bg-orange-400/10 rounded-lg"
						>
							<Key className="w-4 h-4" />
							<span className="sr-only">Cambiar Password</span>
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onToggleActive(user);
							}}
							size="sm"
							variant="ghost"
							className={`h-9 w-9 p-0 rounded-lg ${user.isActive
								? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
								: 'text-slate-400 hover:text-green-400 hover:bg-green-400/10'
								}`}
						>
							{user.isActive ? (
								<UserX className="w-4 h-4" />
							) : (
								<UserCheck className="w-4 h-4" />
							)}
							<span className="sr-only">
								{user.isActive ? 'Desactivar' : 'Activar'}
							</span>
						</Button>
					</div>
				);
			},
		},
	];
