'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from "lucide-react";
import { IUser, UserRole } from "@/types";
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

const userSchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.string().email("Email inválido"),
	password: z.string().optional(),
	phone: z.string().optional(),
	role: z.nativeEnum(UserRole),
});

export interface UserModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: IUser | null;
	reloadUsers: () => void;
	selectedCompanyId?: string;
}

export const UserModal = ({
	isOpen,
	onClose,
	user,
	reloadUsers,
	selectedCompanyId
}: UserModalProps) => {
	const isEditing = !!user;

	const form = useForm<z.infer<typeof userSchema>>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			phone: '',
			role: UserRole.USER,
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				password: '',
				phone: user.phone || '',
				role: user.role,
			});
		} else {
			form.reset({
				name: '',
				email: '',
				password: '',
				phone: '',
				role: UserRole.USER,
			});
		}
	}, [user, form, isOpen]);

	const onSubmit = async (values: z.infer<typeof userSchema>) => {
		try {
			const url = isEditing ? `/api/users/${user._id}` : '/api/users';
			const method = isEditing ? 'PUT' : 'POST';

			const body: any = {
				name: values.name,
				email: values.email,
				phone: values.phone,
				role: values.role,
				companyId: selectedCompanyId,
			};

			if (!isEditing || values.password) {
				body.password = values.password;
			}

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				import('sonner').then(({ toast }) => {
					toast.success(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
				});

				reloadUsers();
				onClose();
			} else {
				import('sonner').then(({ toast }) => {
					toast.error(`Error: ${data.error || 'No se pudo guardar el usuario'}`);
				});
			}
		} catch (error) {
			import('sonner').then(({ toast }) => {
				toast.error('Error al guardar el usuario');
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-white dark:bg-slate-900/95 border-slate-200 dark:border-white/10 glass-card backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl sm:max-w-[450px] p-0 overflow-hidden">
				<DialogHeader className="p-6 border-b border-slate-100 dark:border-white/10">
					<DialogTitle className="text-2xl font-bold">
						{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 dark:text-slate-300">Nombre completo *</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
											placeholder="Juan Pérez"
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
											placeholder="juan@ejemplo.com"
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>

						{!isEditing && (
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-slate-700 dark:text-slate-300">
											Contraseña *
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20"
												placeholder="Mínimo 6 caracteres"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>
						)}

						<div className='flex gap-4 w-full'>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem className='w-full'>
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
								name="role"
								render={({ field }) => (
									<FormItem className='w-full'>
										<FormLabel className="text-slate-700 dark:text-slate-300">Rol *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="w-full min-h-12 bg-white/5 border-white/10 rounded-xl h-11 focus:ring-orange-500/20">
													<SelectValue placeholder="Seleccionar un rol" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												position="popper"
												sideOffset={4}
												className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl">
												<SelectItem value={UserRole.USER}>Usuario</SelectItem>
												<SelectItem value={UserRole.STAFF}>Staff</SelectItem>
												<SelectItem value={UserRole.PROMOTER}>Promotor</SelectItem>
												<SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
												<SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
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
									isEditing ? 'Actualizar' : 'Crear Usuario'
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
