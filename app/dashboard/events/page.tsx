'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS, IEvent, EventStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getEventColumns } from '@/components/events/EventColumns';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useModal } from '@/hooks/useModal';
import {
  Plus,
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EventModal } from '@/components/modals/EventModal';

export default function EventsPage() {
  const { user } = useAuth();
  const { availableEvents, refreshEvents, isLoadingEvents } = useEvent();
  const deleteModal = useModal<IEvent>();
  const editModal = useModal<IEvent>();
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreateEvents = hasPermission(user!.role, PERMISSIONS.EVENT_CREATE);

  const handleEdit = (event: IEvent) => {
    editModal.onOpen(event);
  };

  const handleDeleteClick = (event: IEvent) => {
    deleteModal.onOpen(event);
  };

  const onConfirmDelete = async () => {
    const event = deleteModal.data;
    if (!event) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Evento "${event.name}" eliminado correctamente`);
        deleteModal.onClose();
        refreshEvents();
      } else {
        toast.error(`Error: ${data.error || 'No se pudo eliminar el evento'}`);
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig: Record<EventStatus, { className: string; label: string }> = {
      [EventStatus.DRAFT]: { className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Borrador' },
      [EventStatus.PUBLISHED]: { className: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Publicado' },
      [EventStatus.CANCELLED]: { className: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Cancelado' },
      [EventStatus.COMPLETED]: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Completado' },
    };

    const config = statusConfig[status] || { className: 'bg-slate-500/10 text-slate-400', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const columns = useMemo(() =>
    getEventColumns({
      onEdit: handleEdit,
      onDelete: handleDeleteClick,
      getStatusBadge,
    }),
    []);

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.EVENT_READ]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Administración</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
              Gestión de Eventos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Visualiza, organiza y controla todas tus experiencias activas.</p>
          </div>
          {canCreateEvents && (
            <Button
              onClick={() => editModal.onOpen()}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold h-auto transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <Plus className="w-6 h-6 mr-2" />
              Crear Nuevo Evento
            </Button>
          )}
        </div>

        {/* Events List */}
        <DataTable
          columns={columns}
          data={availableEvents}
          isLoading={isLoadingEvents}
          searchKey="name"
          searchPlaceholder="Buscar por nombre de evento..."
          emptyMessage="No se encontraron eventos para mostrar."
          renderToolbar={(table) => (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-colors">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <Select
                  value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) => {
                    const filterValue = value === 'all' ? '' : value;
                    table.getColumn("status")?.setFilterValue(filterValue);
                  }}
                >
                  <SelectTrigger className="w-[140px] border-none bg-transparent text-slate-700 dark:text-white h-6 focus:ring-0 text-xs font-bold p-0 shadow-none">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="bg-slate-900 border-white/10 text-white rounded-xl">
                    <SelectItem value="all" className="text-xs bg-none font-bold">Todos los estados</SelectItem>
                    <SelectItem value={EventStatus.DRAFT} className="text-xs font-bold text-slate-400">Borrador</SelectItem>
                    <SelectItem value={EventStatus.PUBLISHED} className="text-xs font-bold text-green-400">Publicado</SelectItem>
                    <SelectItem value={EventStatus.CANCELLED} className="text-xs font-bold text-red-400">Cancelado</SelectItem>
                    <SelectItem value={EventStatus.COMPLETED} className="text-xs font-bold text-orange-400">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        />

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <ConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.onClose}
            onConfirm={onConfirmDelete}
            isLoading={isDeleting}
            title="Eliminar Evento"
            description={`¿Estás seguro de que deseas eliminar permanentemente el evento "${deleteModal.data?.name}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
            confirmLabel="Eliminar Definitivamente"
            variant="danger"
          />
        )}

        {/* Edit/Create Modal */}
        {editModal.isOpen && (
          <EventModal
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
            event={editModal.data}
            reloadEvents={refreshEvents}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
