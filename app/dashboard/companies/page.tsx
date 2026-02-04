'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ICompany } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CompanyModal } from '@/components/modals/CompanyModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useModal } from '@/hooks/useModal';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { getCompanyColumns } from '@/components/company/CompanyColumns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompany } from '@/contexts/CompanyContext';

export default function CompaniesPage() {
  const { user } = useAuth();
  const { refreshCompanies } = useCompany();
  const router = useRouter();
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const companyModal = useModal<ICompany>();
  const confirmModal = useModal<ICompany>();

  useEffect(() => {
    // Only SUPER_ADMIN can access this page
    if (user && user.role !== UserRole.SUPER_ADMIN) {
      router.push('/dashboard');
      return;
    }

    loadCompanies();
  }, [user, router]);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/companies?limit=1000', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCompanies(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Error al cargar las compañías');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company: ICompany) => {
    companyModal.onOpen(company);
  };

  const openCreateModal = () => {
    companyModal.onOpen();
  };

  const handleToggleActive = (company: ICompany) => {
    confirmModal.onOpen(company);
  };

  const onConfirmToggleActive = async () => {
    const company = confirmModal.data;
    if (!company) return;

    try {
      setIsDeactivating(true);
      const response = await fetch(`/api/companies/${company._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !company.isActive }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Compañía ${company.isActive ? 'desactivada' : 'activada'} exitosamente`);
        confirmModal.onClose();
        loadCompanies();
      } else {
        toast.error(`Error: ${data.error || 'No se pudo actualizar la compañía'}`);
      }
    } catch (error) {
      toast.error('Error al actualizar la compañía');
    } finally {
      setIsDeactivating(false);
    }
  };

  const columns = useMemo(() =>
    getCompanyColumns({
      onEdit: handleEdit,
      onToggleActive: handleToggleActive,
    }),
    []);

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
            Gestión de Compañías
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Administra todas las compañías de la plataforma
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-4 rounded-xl font-bold h-auto transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Compañía
        </Button>
      </div>

      {/* Companies Table */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="relative inline-block">
            <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Cargando compañías...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={companies}
          isLoading={isLoading}
          onRowClick={handleEdit}
          searchKey="name"
          searchPlaceholder="Buscar por nombre o email..."
          renderToolbar={(table) => (
            <div className="flex items-center gap-2">
              <Select
                value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                onValueChange={(value) => {
                  const filterValue = value === 'all' ? '' : value === 'true';
                  table.getColumn("isActive")?.setFilterValue(filterValue);
                }}
              >
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white rounded-xl h-10 focus:ring-orange-500/20">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="bg-slate-900 border-white/10 text-white rounded-xl">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Activas</SelectItem>
                  <SelectItem value="false">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      )}

      {/* Create/Edit Modal */}
      {companyModal.isOpen && (
        <CompanyModal
          isOpen={companyModal.isOpen}
          onClose={companyModal.onClose}
          company={companyModal.data}
          reloadCompanies={loadCompanies}
          refreshCompanies={refreshCompanies}
        />
      )}

      {/* Deactivation Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.onClose}
          onConfirm={onConfirmToggleActive}
          isLoading={isDeactivating}
          title={confirmModal.data?.isActive ? 'Desactivar Compañía' : 'Activar Compañía'}
          description={`¿Estás seguro de que deseas ${confirmModal.data?.isActive ? 'desactivar' : 'activar'
            } la compañía "${confirmModal.data?.name}"?`}
          confirmLabel={confirmModal.data?.isActive ? 'Desactivar' : 'Activar'}
          variant={confirmModal.data?.isActive ? 'danger' : 'info'}
        />
      )}
    </div>
  );
}
