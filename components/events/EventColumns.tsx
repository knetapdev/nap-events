import { ColumnDef } from '@tanstack/react-table';
import { IEvent, EventStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventColumnProps {
	onEdit: (event: IEvent) => void;
	onDelete: (event: IEvent) => void;
	getStatusBadge: (status: EventStatus) => React.ReactNode;
}

export const getEventColumns = ({
	onEdit,
	onDelete,
	getStatusBadge,
}: EventColumnProps): ColumnDef<IEvent>[] => [
		{
			accessorKey: 'name',
			header: 'Evento',
			enableSorting: true,
			cell: ({ row }) => {
				const event = row.original;
				return (
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 shadow-lg shadow-black/20">
							{event.coverImage ? (
								<img
									src={event.coverImage}
									alt={event.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-500/20 to-cyan-500/20">
									<Calendar className="w-5 h-5 text-orange-400" />
								</div>
							)}
						</div>
						<div className="min-w-0">
							<p className="font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px]">{event.name}</p>
							<div className="flex items-center gap-1.5 text-[10px] text-slate-500">
								<MapPin className="w-3 h-3 text-orange-400" />
								<span className="truncate text-[12px]">{event.location}</span>
							</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: 'status',
			header: 'Estado',
			enableSorting: true,
			cell: ({ row }) => getStatusBadge(row.original.status),
		},
		{
			accessorKey: 'startDate',
			header: 'Fecha de Inicio',
			enableSorting: true,
			cell: ({ row }) => {
				const date = new Date(row.original.startDate);
				return (
					<div className="flex flex-col">
						<span className="text-slate-900 dark:text-white font-medium text-sm">
							{format(date, "d 'de' MMM, yyyy", { locale: es })}
						</span>
						<span className="text-xs text-slate-500 font-bold">
							{format(date, "HH:mm 'hrs'")}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: 'ticketConfigs',
			header: 'Tickets',
			cell: ({ row }) => {
				const configs = row.original.ticketConfigs || [];
				const totalTickets = configs.reduce((acc, curr) => acc + curr.quantity, 0);
				const totalSold = configs.reduce((acc, curr) => acc + curr.sold, 0);

				return (
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
							<span>{totalSold} / {totalTickets}</span>
							<span>{Math.round((totalSold / (totalTickets || 1)) * 100)}%</span>
						</div>
						<div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
							<div
								className="h-full bg-primary transition-all duration-500"
								style={{ width: `${Math.min(100, (totalSold / (totalTickets || 1)) * 100)}%` }}
							/>
						</div>
					</div>
				);
			},
		},
		{
			id: 'actions',
			header: () => <div className="text-right">Acciones</div>,
			cell: ({ row }) => {
				const event = row.original;
				return (
					<div className="flex items-center justify-end gap-2 text-right">
						<Button
							onClick={(e) => {
								e.stopPropagation();
								window.open(`/events/${event.slug}`, '_blank');
							}}
							size="sm"
							variant="ghost"
							className="h-9 w-9 p-0 text-slate-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg"
							title="Ver Página Pública"
						>
							<ExternalLink className="w-4 h-4" />
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onEdit(event);
							}}
							size="sm"
							variant="ghost"
							className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
							title="Editar Evento"
						>
							<Pencil className="w-4 h-4" />
						</Button>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								onDelete(event);
							}}
							size="sm"
							variant="ghost"
							className="h-9 w-9 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
							title="Eliminar Evento"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				);
			},
		},
	];
