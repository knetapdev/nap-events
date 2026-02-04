'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { UserRole } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanySelectorProps {
  withLabel?: boolean;
}

export default function CompanySelector({ withLabel = true }: CompanySelectorProps) {
  const { user } = useAuth();
  const { availableCompanies, selectedCompany, selectCompany, isLoadingCompanies } = useCompany();

  console.log(availableCompanies)
  // Only show for SUPER_ADMIN
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  if (isLoadingCompanies) {
    return (
      <div className="w-full h-10 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
    );
  }

  if (availableCompanies.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {withLabel && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Compañía
        </label>
      )}
      <Select
        value={selectedCompany?._id}
        onValueChange={(value) => selectCompany(value)}
      >
        <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all h-10 rounded-lg">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <SelectValue placeholder="Seleccionar compañía" />
          </div>
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl w-[--radix-select-trigger-width]"
        >
          {availableCompanies.map((company) => (
            <SelectItem
              key={company._id}
              value={company._id}
              className="focus:bg-primary focus:text-white cursor-pointer py-3"
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{company.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{company.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
