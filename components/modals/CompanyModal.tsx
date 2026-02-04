'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from "lucide-react";
import { ICompany } from "@/types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { toast } from 'sonner';

const companySchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.string().email("Email inválido"),
	phone: z.string().optional(),
	address: z.string().optional(),
	website: z.string().optional(),
	taxId: z.string().optional(),
	timezone: z.string().default('America/Lima'),
	currency: z.string().default('PEN'),
	language: z.string().default('es'),
});

export interface CompanyModalProps {
	isOpen: boolean;
	onClose: () => void;
	company: ICompany | null;
	reloadCompanies: () => void;
	refreshCompanies: () => void;
}

export const CompanyModal = ({
	isOpen,
	onClose,
	company,
	reloadCompanies,
	refreshCompanies
}: CompanyModalProps) => {
	const isEditing = !!company;

	const form = useForm<z.infer<typeof companySchema>>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			address: '',
			website: '',
			taxId: '',
			timezone: 'America/Lima',
			currency: 'PEN',
			language: 'es',
		},
	});

	useEffect(() => {
		if (company) {
			form.reset({
				name: company.name,
				email: company.email,
				phone: company.phone || '',
				address: company.address || '',
				website: company.website || '',
				taxId: company.taxId || '',
				timezone: company.settings?.timezone || 'America/Lima',
				currency: company.settings?.currency || 'PEN',
				language: company.settings?.language || 'es',
			});
		} else {
			form.reset({
				name: '',
				email: '',
				phone: '',
				address: '',
				website: '',
				taxId: '',
				timezone: 'America/Lima',
				currency: 'PEN',
				language: 'es',
			});
		}
	}, [company, form, isOpen]);

	const onSubmit = async (values: z.infer<typeof companySchema>) => {
		try {
			const url = isEditing ? `/api/companies/${company._id}` : '/api/companies';
			const method = isEditing ? 'PUT' : 'POST';

			const body = {
				name: values.name,
				email: values.email,
				phone: values.phone,
				address: values.address,
				website: values.website,
				taxId: values.taxId,
				settings: {
					timezone: values.timezone,
					currency: values.currency,
					language: values.language,
				},
			};

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				toast.success(isEditing ? 'Compañía actualizada exitosamente' : 'Compañía creada exitosamente');
				refreshCompanies();
				reloadCompanies();
				onClose();
			} else {
				toast.error(`Error: ${data.error || 'No se pudo guardar la compañía'}`);
			}
		} catch (error) {
			console.error('Error saving company:', error);
			toast.error('Error al guardar la compañía');
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-white dark:bg-slate-900/95 border-slate-200 dark:border-white/10 glass-card backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl sm:max-w-[550px] p-0 overflow-hidden">
				<DialogHeader className="p-6 border-b border-slate-100 dark:border-white/10">
					<DialogTitle className="text-2xl font-bold">
						{isEditing ? 'Editar Compañía' : 'Nueva Compañía'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Nombre *</FormLabel>
										<FormControl>
											<Input
												{...field}
												className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
												placeholder="Mi Empresa S.A.C."
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Email *</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="email"
												className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
												placeholder="contacto@empresa.com"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Teléfono</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="tel"
												className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
												placeholder="+51 999 999 999"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="taxId"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">RUC</FormLabel>
										<FormControl>
											<Input
												{...field}
												className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
												placeholder="20123456789"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 dark:text-slate-300">Dirección</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
											placeholder="Av. Principal 123, Lima"
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 dark:text-slate-300">Sitio Web</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
											placeholder="https://miempresa.com"
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="timezone"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Zona Horaria</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20">
													<SelectValue placeholder="Seleccionar" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												position="popper"
												sideOffset={4}
												className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl">
												<SelectItem value="America/Lima">Lima</SelectItem>
												<SelectItem value="America/Bogota">Bogotá</SelectItem>
												<SelectItem value="America/Mexico_City">CDMX</SelectItem>
												<SelectItem value="America/Santiago">Santiago</SelectItem>
												<SelectItem value="America/Buenos_Aires">Buenos Aires</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Moneda</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20">
													<SelectValue placeholder="Seleccionar" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												position="popper"
												sideOffset={4}
												className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl">
												<SelectItem value="PEN">PEN (S/.)</SelectItem>
												<SelectItem value="USD">USD ($)</SelectItem>
												<SelectItem value="EUR">EUR (€)</SelectItem>
												<SelectItem value="COP">COP</SelectItem>
												<SelectItem value="MXN">MXN</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="language"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">Idioma</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20">
													<SelectValue placeholder="Seleccionar" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												position="popper"
												sideOffset={4}
												className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl">
												<SelectItem value="es">Español</SelectItem>
												<SelectItem value="en">English</SelectItem>
												<SelectItem value="pt">Português</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex items-center justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl h-11"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="btn-gradient px-8 rounded-xl h-11 font-bold shadow-lg shadow-orange-500/20 border-none transition-all active:scale-95"
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Guardando...
									</>
								) : (
									isEditing ? 'Actualizar' : 'Crear Compañía'
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
