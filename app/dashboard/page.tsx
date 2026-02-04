'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/types';
import EventSelector from '@/components/EventSelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Ticket,
  Wallet,
  CheckCircle,
  Plus,
  BarChart3,
  QrCode,
  Info,
  Calendar,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedEvent } = useEvent();
  const [stats, setStats] = useState({
    totalTickets: 0,
    revenue: 0,
    checkins: 0,
  });

  useEffect(() => {
    if (selectedEvent) {
      setStats({
        totalTickets: 0,
        revenue: 0,
        checkins: 0,
      });
    }
  }, [selectedEvent]);

  if (!user) return null;

  const canCreateEvents = hasPermission(user.role, PERMISSIONS.EVENT_CREATE);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
            Dashboard
          </h1>
          {selectedEvent ? (
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              Evento activo: <span className="text-orange-600 dark:text-orange-300 font-semibold">{selectedEvent.name}</span>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Bienvenido de nuevo a NapEvents</p>
          )}
        </div>

        {canCreateEvents && (
          <div className='flex flex-row gap-2'>
            <EventSelector withLabel={false} withDetails={false} />

            {/* <Button asChild className="bg-primary hover:bg-primary/90 text-white border-none px-8 py-2 rounded-xl font-bold h-12 mt-4">
              <Link href="/dashboard/events/new" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Evento
              </Link>
            </Button> */}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {selectedEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-slate-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-900 dark:text-white">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entradas Vendidas</CardTitle>
              <Ticket className="w-5 h-5 text-orange-500 dark:text-orange-400 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{stats.totalTickets}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500">Tickets generados para este evento</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-900 dark:text-white">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ingresos Totales</CardTitle>
              <Wallet className="w-5 h-5 text-amber-500 dark:text-amber-400 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">S/. {stats.revenue}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500">Recaudación acumulada</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-slate-200 dark:border-white/10 hover:border-cyan-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-900 dark:text-white">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check-ins</CardTitle>
              <CheckCircle className="w-5 h-5 text-cyan-500 dark:text-cyan-400 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{stats.checkins}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500">Accesos validados en puerta</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 flex items-start gap-4 transition-colors">
          <AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">No hay evento seleccionado</h3>
            <p className="text-slate-600 dark:text-slate-400">Por favor, selecciona un evento desde el panel lateral para visualizar las estadísticas y gestionar las acciones rápidas.</p>
          </div>
        </div>
      )}

      {/* Quick Actions & Event Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/tickets">
              <div className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-orange-500/5">
                  <Ticket className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ver Entradas</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Gestiona y revisa todas las ventas de tickets.</p>
              </div>
            </Link>

            {hasPermission(user.role, PERMISSIONS.TICKET_CHECKIN) && (
              <Link href="/dashboard/tickets/scan">
                <div className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-amber-500/5">
                    <QrCode className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Escanear QR</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Valida entradas rápidamente en la entrada.</p>
                </div>
              </Link>
            )}

            {hasPermission(user.role, PERMISSIONS.REPORT_VIEW) && (
              <Link href="/dashboard/reports">
                <div className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-cyan-500/5">
                    <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ver Reportes</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Análisis detallado del rendimiento de tus eventos.</p>
                </div>
              </Link>
            )}

            <div className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group opacity-50 cursor-not-allowed shadow-none">
              <div className="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Más Funciones</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Próximamente estaremos añadiendo más herramientas.</p>
            </div>
          </div>
        </div>

        {/* Event Detail */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Detalle del Evento
          </h2>
          {selectedEvent ? (
            <Card className="glass-card border-slate-200 dark:border-white/10 overflow-hidden rounded-3xl shadow-sm dark:shadow-none">
              <div className="h-32 bg-primary/10 dark:bg-primary/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-primary/30" />
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1">{selectedEvent.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedEvent.location}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-500 font-medium">Estado</span>
                    <span className="px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Fecha</span>
                    <span className="text-slate-900 dark:text-slate-300 font-medium">
                      {new Date(selectedEvent.startDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Invitados</span>
                    <span className="text-slate-900 dark:text-slate-300 font-medium">--</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 mt-4 rounded-xl font-bold transition-all active:scale-95" asChild>
                  <Link href={`/dashboard/events/${selectedEvent._id}`}>Ver Configuración</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-white/5 p-8 text-center border-dashed">
              <Info className="w-10 h-10 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm italic">Selecciona un evento para ver los detalles aquí.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
