'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCompanyDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    website: '',
    timezone: 'America/Lima',
    currency: 'PEN',
    language: 'es',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          settings: {
            timezone: formData.timezone,
            currency: formData.currency,
            language: formData.language,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear compañía');
      }

      toast.success('Compañía creada exitosamente');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        website: '',
        timezone: 'America/Lima',
        currency: 'PEN',
        language: 'es',
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear compañía');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Nueva Compañía
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Crea una nueva compañía en la plataforma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la compañía"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@compania.com"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+51 999 999 999"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-slate-700 dark:text-slate-300">
                  RUC/Tax ID
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="20123456789"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">
                Dirección
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Principal 123, Lima"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-700 dark:text-slate-300">
                Sitio Web
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.compania.com"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Configuración
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-slate-700 dark:text-slate-300">
                  Zona Horaria
                </Label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                >
                  <option value="America/Lima">Lima</option>
                  <option value="America/New_York">New York</option>
                  <option value="America/Mexico_City">Ciudad de México</option>
                  <option value="America/Buenos_Aires">Buenos Aires</option>
                  <option value="Europe/Madrid">Madrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300">
                  Moneda
                </Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                >
                  <option value="PEN">PEN (Soles)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                  <option value="MXN">MXN (Pesos MX)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-slate-700 dark:text-slate-300">
                  Idioma
                </Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 dark:border-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Crear Compañía
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
