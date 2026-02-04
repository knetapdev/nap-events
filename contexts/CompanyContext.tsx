'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { ICompany, UserRole } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { todo } from 'node:test';

interface CompanyContextType {
  selectedCompany: ICompany | null;
  availableCompanies: ICompany[];
  isLoadingCompanies: boolean;
  selectCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
  activeCompanyId: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const SELECTED_COMPANY_KEY = 'selected_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [availableCompanies, setAvailableCompanies] = useState<ICompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.SUPER_ADMIN) {
        refreshCompanies();
      } else {
        setIsLoadingCompanies(false);
      }
    } else {
      setAvailableCompanies([]);
      setSelectedCompany(null);
      setIsLoadingCompanies(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (availableCompanies.length > 0 && user?.role === UserRole.SUPER_ADMIN) {
      const savedCompanyId = localStorage.getItem(SELECTED_COMPANY_KEY);

      if (savedCompanyId) {
        const savedCompany = availableCompanies.find((c) => c._id === savedCompanyId);
        if (savedCompany) {
          setSelectedCompany(savedCompany);
          return;
        }
      }

      setSelectedCompany(availableCompanies[0]);
      localStorage.setItem(SELECTED_COMPANY_KEY, availableCompanies[0]._id);
    }
  }, [availableCompanies, user]);

  const refreshCompanies = async () => {
    console.log('test')
    try {
      setIsLoadingCompanies(true);
      const response = await fetch('/api/companies?limit=1000', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableCompanies(data.data);
        } else setAvailableCompanies([]);
      }
    } catch (error) {
      setAvailableCompanies([]);
      toast.error(`Invalid response from server, ${error}`);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const selectCompany = useCallback((companyId: string) => {
    const company = availableCompanies.find((c) => c._id === companyId);
    if (company) {
      setSelectedCompany(company);
      localStorage.setItem(SELECTED_COMPANY_KEY, companyId);
    }
  }, [availableCompanies]);

  // todo: revisar en otreo usaurio(not super admin)
  const activeCompanyId = useMemo(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      return selectedCompany?._id ?? '';
    }
    return user?.companyId ?? '';
  }, [user, selectedCompany]);


  const value: CompanyContextType = {
    selectedCompany,
    availableCompanies,
    isLoadingCompanies,
    selectCompany,
    refreshCompanies,
    activeCompanyId,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
