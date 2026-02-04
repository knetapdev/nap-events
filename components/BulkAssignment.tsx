'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Users,
  UserPlus,
  ShieldCheck,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { IEvent, UserRole } from '@/types';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface BulkAssignmentProps {
  availableEvents: IEvent[];
  allUsers: User[];
  onSuccess: () => void;
}

export default function BulkAssignment({ availableEvents, allUsers, onSuccess }: BulkAssignmentProps) {
  const { selectedCompany } = useCompany();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PROMOTER);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch existing assignments when event changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedEventId) {
        setAssignedUserIds(new Set());
        return;
      }

      setLoadingAssignments(true);
      try {
        const response = await fetch(`/api/events/${selectedEventId}/assignments`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const existingIds = new Set<string>(
            data.data.map((assignment: { userId: { _id: string } | string }) =>
              typeof assignment.userId === 'object' ? assignment.userId._id : assignment.userId
            )
          );
          setAssignedUserIds(existingIds);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
    // Clear selections when event changes
    setSelectedUserIds(new Set());
    setLeftChecked(new Set());
    setRightChecked(new Set());
  }, [selectedEventId]);

  // Filter users for left panel (available - exclude already assigned)
  const availableUsers = useMemo(() => {
    return allUsers.filter(user => !selectedUserIds.has(user._id) && !assignedUserIds.has(user._id));
  }, [allUsers, selectedUserIds, assignedUserIds]);

  // Filter users for right panel (selected)
  const selectedUsers = useMemo(() => {
    return allUsers.filter(user => selectedUserIds.has(user._id));
  }, [allUsers, selectedUserIds]);

  // Filtered available users by search
  const filteredAvailableUsers = useMemo(() => {
    if (!leftSearch) return availableUsers;
    const search = leftSearch.toLowerCase();
    return availableUsers.filter(
      user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }, [availableUsers, leftSearch]);

  // Filtered selected users by search
  const filteredSelectedUsers = useMemo(() => {
    if (!rightSearch) return selectedUsers;
    const search = rightSearch.toLowerCase();
    return selectedUsers.filter(
      user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }, [selectedUsers, rightSearch]);

  // Toggle check on left panel
  const toggleLeftCheck = (userId: string) => {
    setLeftChecked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Toggle check on right panel
  const toggleRightCheck = (userId: string) => {
    setRightChecked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Toggle all on left
  const toggleAllLeft = () => {
    if (leftChecked.size === filteredAvailableUsers.length) {
      setLeftChecked(new Set());
    } else {
      setLeftChecked(new Set(filteredAvailableUsers.map(u => u._id)));
    }
  };

  // Toggle all on right
  const toggleAllRight = () => {
    if (rightChecked.size === filteredSelectedUsers.length) {
      setRightChecked(new Set());
    } else {
      setRightChecked(new Set(filteredSelectedUsers.map(u => u._id)));
    }
  };

  // Move checked users to right (selected)
  const moveToRight = () => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      leftChecked.forEach(id => newSet.add(id));
      return newSet;
    });
    setLeftChecked(new Set());
  };

  // Move all filtered to right
  const moveAllToRight = () => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      filteredAvailableUsers.forEach(user => newSet.add(user._id));
      return newSet;
    });
    setLeftChecked(new Set());
  };

  // Move checked users to left (available)
  const moveToLeft = () => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      rightChecked.forEach(id => newSet.delete(id));
      return newSet;
    });
    setRightChecked(new Set());
  };

  // Move all filtered to left
  const moveAllToLeft = () => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      filteredSelectedUsers.forEach(user => newSet.delete(user._id));
      return newSet;
    });
    setRightChecked(new Set());
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (!selectedEventId) {
      toast.error('Por favor, selecciona un evento');
      return;
    }

    if (selectedUserIds.size === 0) {
      toast.error('Por favor, selecciona al menos un usuario');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${selectedEventId}/assignments/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userIds: Array.from(selectedUserIds),
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Usuarios asignados exitosamente');
        // Add assigned users to the assigned list
        setAssignedUserIds(prev => {
          const newSet = new Set(prev);
          selectedUserIds.forEach(id => newSet.add(id));
          return newSet;
        });
        // Reset selection state but keep event selected
        setSelectedUserIds(new Set());
        setLeftChecked(new Set());
        setRightChecked(new Set());
        onSuccess();
      } else {
        toast.error(`Error: ${data.error || 'No se pudieron asignar los usuarios'}`);
      }
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleStyles = {
      [UserRole.SUPER_ADMIN]: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      [UserRole.ADMIN]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      [UserRole.PROMOTER]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      [UserRole.STAFF]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      [UserRole.USER]: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
    };

    const roleLabels = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.PROMOTER]: 'Promotor',
      [UserRole.STAFF]: 'Staff',
      [UserRole.USER]: 'Usuario',
    };

    return (
      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${roleStyles[role]}`}>
        {roleLabels[role]}
      </Badge>
    );
  };

  const UserItem = ({
    user,
    checked,
    onToggle,
  }: {
    user: User;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${checked
        ? 'bg-primary/5 border-primary/20 dark:bg-primary/10'
        : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10'
        }`}
      onClick={onToggle}
    >
      <Checkbox checked={checked} className="pointer-events-none" />
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {user.name}
        </p>
        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
      </div>
      {getRoleBadge(user.role)}
    </div>
  );

  return (
    <Card className="glass-card border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Asignación Masiva
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Asigna múltiples usuarios a un evento de forma rápida
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event and Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Evento Destino
            </label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar evento" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-xl max-h-[250px]">
                {availableEvents.map(event => (
                  <SelectItem
                    key={event._id}
                    value={event._id}
                    className="focus:bg-primary focus:text-white py-3 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{event.name}</span>
                      <span className="text-[10px] text-slate-400">{event.status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Rol a Asignar
            </label>
            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-xl">
                <SelectItem value={UserRole.PROMOTER} className="focus:bg-primary focus:text-white py-3 cursor-pointer">
                  Promotor
                </SelectItem>
                <SelectItem value={UserRole.STAFF} className="focus:bg-primary focus:text-white py-3 cursor-pointer">
                  Staff
                </SelectItem>
                <SelectItem value={UserRole.ADMIN} className="focus:bg-primary focus:text-white py-3 cursor-pointer">
                  Administrador
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transfer List - Vertical Layout */}

        <div className="flex flex-row gap-4 w-full">
          {/* Top Panel - Available Users */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50 w-full">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-white/5 px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Usuarios Disponibles
                  </span>
                  {loadingAssignments && (
                    <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {assignedUserIds.size > 0 && (
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      {assignedUserIds.size} ya asignados
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {filteredAvailableUsers.length}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar usuario..."
                  value={leftSearch}
                  onChange={(e) => setLeftSearch(e.target.value)}
                  className="pl-9 h-9 bg-white dark:bg-white/5 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Select All */}
            <div
              className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
              onClick={toggleAllLeft}
            >
              <Checkbox
                checked={filteredAvailableUsers.length > 0 && leftChecked.size === filteredAvailableUsers.length}
                className="pointer-events-none"
              />
              <span className="text-xs text-slate-500 font-medium">
                Seleccionar todos ({leftChecked.size} seleccionados)
              </span>
            </div>

            {/* User List */}
            <ScrollArea className="h-[200px]">
              <div className="p-3 space-y-2">
                {filteredAvailableUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Users className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">
                      {loadingAssignments
                        ? 'Cargando...'
                        : selectedEventId
                          ? 'No hay usuarios disponibles para asignar'
                          : 'Selecciona un evento primero'}
                    </p>
                  </div>
                ) : (
                  filteredAvailableUsers.map(user => (
                    <UserItem
                      key={user._id}
                      user={user}
                      checked={leftChecked.has(user._id)}
                      onToggle={() => toggleLeftCheck(user._id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Transfer Buttons - Horizontal Center */}
          <div className="flex flex-col gap-2 justify-center items-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={moveAllToRight}
              disabled={filteredAvailableUsers.length === 0}
              className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30"
              title="Mover todos abajo"
            >
              <ChevronsDown className="w-4 h-4 mr-1" />
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={moveToRight}
              disabled={leftChecked.size === 0}
              className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30"
              title="Mover seleccionados abajo"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Agregar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={moveToLeft}
              disabled={rightChecked.size === 0}
              className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30"
              title="Mover seleccionados arriba"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Quitar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={moveAllToLeft}
              disabled={filteredSelectedUsers.length === 0}
              className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30"
              title="Mover todos arriba"
            >
              <ChevronsUp className="w-4 h-4 mr-1" />
              Quitar Todos
            </Button>
          </div>

          {/* Bottom Panel - Selected Users */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50 w-full">
            {/* Header */}
            <div className="bg-primary/5 dark:bg-primary/10 px-4 py-3 border-b border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Usuarios a Asignar
                  </span>
                </div>
                <Badge className="bg-primary text-white text-xs">
                  {filteredSelectedUsers.length}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar usuario..."
                  value={rightSearch}
                  onChange={(e) => setRightSearch(e.target.value)}
                  className="pl-9 h-9 bg-white dark:bg-white/5 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Select All */}
            <div
              className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
              onClick={toggleAllRight}
            >
              <Checkbox
                checked={filteredSelectedUsers.length > 0 && rightChecked.size === filteredSelectedUsers.length}
                className="pointer-events-none"
              />
              <span className="text-xs text-slate-500 font-medium">
                Seleccionar todos ({rightChecked.size} seleccionados)
              </span>
            </div>

            {/* User List */}
            <ScrollArea className="h-[200px]">
              <div className="p-3 space-y-2">
                {filteredSelectedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <UserPlus className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm text-center">
                      Selecciona usuarios del panel superior
                    </p>
                  </div>
                ) : (
                  filteredSelectedUsers.map(user => (
                    <UserItem
                      key={user._id}
                      user={user}
                      checked={rightChecked.has(user._id)}
                      onToggle={() => toggleRightCheck(user._id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Warning or Info Message */}
        {selectedUserIds.size > 0 && !selectedEventId && (
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Selecciona un evento destino para continuar con la asignación
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleBulkAssign}
            disabled={isSubmitting || selectedUserIds.size === 0 || !selectedEventId}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Asignando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Asignar {selectedUserIds.size} Usuario{selectedUserIds.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
