'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { IUser, PERMISSIONS, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Plus
} from 'lucide-react';
import { UserModal } from '@/components/modals/UserModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { useModal } from '@/hooks/useModal';
import { DataTable } from '@/components/ui/data-table';
import { getUserColumns } from '@/components/users/UserColumns';
import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userModal = useModal<IUser>();
  const confirmModal = useModal<IUser>();
  const passwordModal = useModal<IUser>();
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: IUser) => {
    userModal.onOpen(user);
  };

  const handlePasswordChange = (user: IUser) => {
    passwordModal.onOpen(user);
  };

  const openCreateModal = () => {
    userModal.onOpen();
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?limit=1000`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.data);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      toast.error(`Error al cargar usuarios:  ${error}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleToggleActive = (user: IUser) => {
    confirmModal.onOpen(user);
  };

  const onConfirmToggleActive = async () => {
    const user = confirmModal.data;
    if (!user) return;

    try {
      setIsDeactivating(true);
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`);
        confirmModal.onClose();
        loadUsers();
      } else {
        toast.error(`Error: ${data.error || 'No se pudo actualizar el usuario'}`);
      }
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsDeactivating(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig: Record<UserRole, { className: string; label: string }> = {
      [UserRole.SUPER_ADMIN]: { className: 'badge-vip', label: 'Super Admin' },
      [UserRole.ADMIN]: { className: 'badge-general', label: 'Administrador' },
      [UserRole.PROMOTER]: { className: 'badge-confirmed', label: 'Promotor' },
      [UserRole.STAFF]: { className: 'badge-pending', label: 'Staff' },
      [UserRole.USER]: { className: 'badge-used', label: 'Usuario' },
    };

    const config = roleConfig[role];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const columns = useMemo(() =>
    getUserColumns({
      onEdit: handleEdit,
      onToggleActive: handleToggleActive,
      getRoleBadge,
      onChangePassword: handlePasswordChange,
    }),
    []);

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.USER_CREATE]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Crea, edita y administra todos los usuarios del sistema</p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-4 rounded-xl font-bold h-auto transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Usuario
          </Button>
        </div>


        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Cargando usuarios...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            onRowClick={handleEdit}
            searchKey="name"
            searchPlaceholder="Buscar por nombre o email..."
            renderToolbar={(table) => (
              <div className="flex items-center gap-2">
                <Select
                  value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) => {
                    const filterValue = value === 'all' ? '' : value;
                    table.getColumn("role")?.setFilterValue(filterValue);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white rounded-xl h-10 focus:ring-orange-500/20">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="bg-slate-900 border-white/10 text-white rounded-xl">
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                    <SelectItem value={UserRole.PROMOTER}>Promotor</SelectItem>
                    <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                    <SelectItem value={UserRole.USER}>Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        )}

        {/* Create/Edit Modal */}
        {userModal.isOpen && (
          <UserModal
            isOpen={userModal.isOpen}
            onClose={userModal.onClose}
            user={userModal.data}
            reloadUsers={loadUsers}
          />
        )}

        {/* Deactivation Confirmation Modal */}
        {confirmModal.isOpen && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={confirmModal.onClose}
            onConfirm={onConfirmToggleActive}
            isLoading={isDeactivating}
            title={confirmModal.data?.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
            description={`¿Estás seguro de que deseas ${confirmModal.data?.isActive ? 'desactivar' : 'activar'
              } a ${confirmModal.data?.name}?`}
            confirmLabel={confirmModal.data?.isActive ? 'Desactivar' : 'Activar'}
            variant={confirmModal.data?.isActive ? 'danger' : 'info'}
          />
        )}

        {/* Change Password Modal */}
        {passwordModal.isOpen && (
          <ChangePasswordModal
            isOpen={passwordModal.isOpen}
            onClose={passwordModal.onClose}
            user={passwordModal.data}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
