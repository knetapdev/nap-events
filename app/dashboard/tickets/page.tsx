'use client';

import React, { useEffect, useState } from 'react';
import { useEvent } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Ticket,
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface TicketData {
  _id: string;
  ticketType: string;
  status: string;
  qrCode: string;
  price: number;
  purchasedAt: string;
  checkInTime?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export default function TicketsPage() {
  const { selectedEvent } = useEvent();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const canCreateTickets = hasPermission(user!.role, PERMISSIONS.TICKET_CREATE);
  const canCheckin = hasPermission(user!.role, PERMISSIONS.TICKET_CHECKIN);

  useEffect(() => {
    if (selectedEvent) {
      loadTickets();
    }
  }, [selectedEvent]);

  const loadTickets = async () => {
    if (!selectedEvent) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${selectedEvent._id}/tickets`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTickets(data.data);
      } else {
        console.error('Error loading tickets:', data.error);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async (ticketId: string) => {
    if (!confirm('¿Confirmar check-in de esta entrada?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${ticketId}/checkin`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Check-in realizado exitosamente');
        loadTickets();
      } else {
        toast.error(`Error: ${data.error || 'No se pudo realizar el check-in'}`);
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Error al realizar el check-in');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchText = searchTerm.toLowerCase();
    const guestName = ticket.guestName?.toLowerCase() || '';
    const guestEmail = ticket.guestEmail?.toLowerCase() || '';
    const userName = ticket.userId?.name?.toLowerCase() || '';
    const userEmail = ticket.userId?.email?.toLowerCase() || '';

    const matchesSearch = guestName.includes(searchText) ||
      guestEmail.includes(searchText) ||
      userName.includes(searchText) ||
      userEmail.includes(searchText);

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesType = typeFilter === 'all' || ticket.ticketType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      PENDING: { className: 'badge-pending', label: 'Pendiente' },
      CONFIRMED: { className: 'badge-confirmed', label: 'Confirmado' },
      CANCELLED: { className: 'badge-cancelled', label: 'Cancelado' },
      USED: { className: 'badge-used', label: 'Usado' },
    };

    const config = statusConfig[status] || { className: 'badge-pending', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { className: string; label: string }> = {
      FREE: { className: 'badge-free', label: 'Gratis' },
      VIP: { className: 'badge-vip', label: 'VIP' },
      GENERAL: { className: 'badge-general', label: 'General' },
      EARLY_BIRD: { className: 'badge-confirmed', label: 'Early Bird' },
    };

    const config = typeConfig[type] || { className: 'badge-general', label: type };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!selectedEvent) {
    return (
      <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-500 mb-2">No hay evento seleccionado</h3>
            <p className="text-slate-400">Selecciona un evento desde el panel lateral para ver las entradas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
            Entradas del Evento
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona las entradas de: <span className="text-primary font-semibold">{selectedEvent.name}</span>
          </p>
        </div>
        {canCreateTickets && (
          <Button
            onClick={() => toast.info('Función de crear ticket en desarrollo')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-xl font-bold h-auto transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Vender Entrada
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{tickets.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">
                  {tickets.filter((t) => t.status === 'CONFIRMED').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Usados</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {tickets.filter((t) => t.status === 'USED').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ingresos</p>
                <p className="text-2xl font-bold text-pink-400">
                  S/. {tickets.reduce((sum, t) => sum + t.price, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="pl-10 input-dark rounded-lg h-11"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-dark px-4 py-2 rounded-lg h-11"
            >
              <option value="all">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="USED">Usado</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-dark px-4 py-2 rounded-lg h-11"
            >
              <option value="all">Todos los tipos</option>
              <option value="FREE">Gratis</option>
              <option value="VIP">VIP</option>
              <option value="GENERAL">General</option>
              <option value="EARLY_BIRD">Early Bird</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="relative inline-block">
            <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Cargando entradas...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="glass-card border-white/10 border-dashed">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Ticket className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No se encontraron entradas'
                : 'No hay entradas vendidas'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Las entradas vendidas aparecerán aquí'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">Cliente</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-left">Precio</th>
                  <th className="px-6 py-4 text-left">Fecha de Compra</th>
                  <th className="px-6 py-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {ticket.userId?.name || ticket.guestName || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {ticket.userId?.email || ticket.guestEmail || 'Sin email'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(ticket.ticketType)}</td>
                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">S/. {ticket.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">
                        {new Date(ticket.purchasedAt).toLocaleDateString('es-PE')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canCheckin && ticket.status === 'CONFIRMED' && (
                        <Button
                          onClick={() => handleCheckin(ticket._id)}
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Check-in
                        </Button>
                      )}
                      {ticket.status === 'USED' && ticket.checkInTime && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.checkInTime).toLocaleString('es-PE')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
