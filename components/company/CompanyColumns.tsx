'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ICompany } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Building2, Power, PowerOff } from 'lucide-react';
import React from 'react';

interface CompanyColumnProps {
    onEdit: (company: ICompany) => void;
    onToggleActive: (company: ICompany) => void;
}

export const getCompanyColumns = ({
    onEdit,
    onToggleActive,
}: CompanyColumnProps): ColumnDef<ICompany>[] => [
        {
            accessorKey: 'name',
            header: 'Compañía',
            enableSorting: true,
            cell: ({ row }) => {
                const company = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center shadow-lg border border-white/10">
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <Building2 className="w-5 h-5 text-orange-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-950 dark:text-white tracking-tight">{company.name}</p>
                            <p className="text-xs text-slate-500">{company.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'phone',
            header: 'Teléfono',
            cell: ({ row }) => (
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {row.original.phone || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Dirección',
            cell: ({ row }) => (
                <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px] block">
                    {row.original.address || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'settings.currency',
            header: 'Moneda',
            cell: ({ row }) => (
                <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                    {row.original.settings?.currency || 'PEN'}
                </span>
            ),
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
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                    >
                        {active ? 'Activa' : 'Inactiva'}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Acciones</div>,
            cell: ({ row }) => {
                const company = row.original;
                return (
                    <div className="flex items-center justify-end gap-2 text-right">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(company);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
                            title="Editar"
                        >
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActive(company);
                            }}
                            size="sm"
                            variant="ghost"
                            className={`h-9 w-9 p-0 rounded-lg ${company.isActive
                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                                : 'text-slate-400 hover:text-green-400 hover:bg-green-400/10'
                                }`}
                            title={company.isActive ? 'Desactivar' : 'Activar'}
                        >
                            {company.isActive ? (
                                <PowerOff className="w-4 h-4" />
                            ) : (
                                <Power className="w-4 h-4" />
                            )}
                            <span className="sr-only">
                                {company.isActive ? 'Desactivar' : 'Activar'}
                            </span>
                        </Button>
                    </div>
                );
            },
        },
    ];
