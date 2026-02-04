'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { IEvent, EventStatus } from '@/types';
import { toast } from 'sonner';
import { Loader2, Save, X, Calendar, MapPin, FileText, Image as ImageIcon } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { ImageUpload } from '@/components/ui/image-upload';
import { ScrollArea } from '@/components/ui/scroll-area';

const eventSchema = z.object({
	name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
	description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
	location: z.string().min(3, 'La ubicación es requerida'),
	address: z.string().default(''),
	startDate: z.date({
		message: "La fecha de inicio es requerida",
	}),
	endDate: z.date({
		message: "La fecha de fin es requerida",
	}),
	coverImage: z.string().default(''),
	status: z.nativeEnum(EventStatus),
}).refine((data) => {
	return data.endDate > data.startDate;
}, {
	message: 'La fecha de fin debe ser posterior a la fecha de inicio',
	path: ['endDate'],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventModalProps {
	isOpen: boolean;
	onClose: () => void;
	event?: IEvent | null;
	reloadEvents: () => void;
	companyId: string;
}

export function EventModal({ isOpen, onClose, event, reloadEvents, companyId }: EventModalProps) {

	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<EventFormValues>({
		resolver: zodResolver(eventSchema) as any,
		defaultValues: {
			name: '',
			description: '',
			location: '',
			address: '',
			startDate: undefined,
			endDate: undefined,
			coverImage: '',
			status: EventStatus.DRAFT,
		},
	});

	useEffect(() => {
		if (event) {
			form.reset({
				name: event.name,
				description: event.description,
				location: event.location,
				address: event.address || '',
				startDate: new Date(event.startDate),
				endDate: new Date(event.endDate),
				coverImage: event.coverImage || '',
				status: event.status,
			});
		} else {
			form.reset({
				name: '',
				description: '',
				location: '',
				address: '',
				startDate: undefined,
				endDate: undefined,
				coverImage: '',
				status: EventStatus.DRAFT,
			});
		}
	}, [event, form, isOpen]);

	const onSubmit = async (values: EventFormValues) => {
		setIsSubmitting(true);
		try {
			const url = event ? `/api/events/${event._id}` : '/api/events';
			const method = event ? 'PUT' : 'POST';

			console.log(companyId)
			console.log(event?.companyId)

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ ...values, companyId: companyId ? companyId : event?.companyId }),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				toast.success(event ? 'Evento actualizado' : 'Evento creado');
				reloadEvents();
				onClose();
			} else {
				toast.error(data.error || 'Error al procesar el evento');
			}
		} catch (error) {
			toast.error('Error de conexión con el servidor');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="md:min-w-4xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden rounded-[2rem] shadow-2xl">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="text-2xl font-bold flex items-center gap-2">
						{event ? (
							<><Save className="w-6 h-6 text-orange-500" /> Editar Evento</>
						) : (
							<><Calendar className="w-6 h-6 text-orange-500" /> Nuevo Evento</>
						)}
					</DialogTitle>
					<DialogDescription className="text-slate-500 dark:text-slate-400">
						{event ? 'Modifica los detalles del evento existente.' : 'Completa la información para crear un nuevo evento.'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
						<ScrollArea className="flex-1 max-h-[75vh] px-8 py-6">
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
								{/* Columna Izquierda: Datos del Evento (8/12) */}
								<div className="lg:col-span-7 space-y-8">
									{/* Sección: Información Principal */}
									<div className="space-y-6">
										<div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
											<div className="p-2 bg-orange-500/10 rounded-lg">
												<FileText className="w-5 h-5 text-orange-500" />
											</div>
											<h3 className="text-base font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Información General</h3>
										</div>

										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Nombre del Evento</FormLabel>
													<FormControl>
														<Input {...field} placeholder="P.ej: Festival de Verano 2026" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl h-12 focus:ring-orange-500/20 text-base" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Descripción detallada</FormLabel>
													<FormControl>
														<Textarea {...field} rows={5} placeholder="Cuéntanos más sobre el evento..." className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-orange-500/20 text-base resize-none" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Sección: Ubicación y Tiempo */}
									<div className="space-y-6 pt-2">
										<div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
											<div className="p-2 bg-cyan-500/10 rounded-lg">
												<MapPin className="w-5 h-5 text-cyan-500" />
											</div>
											<h3 className="text-base font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Ubicación y Tiempo</h3>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="startDate"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Fecha y Hora de Inicio</FormLabel>
														<FormControl>
															<DateTimePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="endDate"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Fecha y Hora de Fin</FormLabel>
														<FormControl>
															<DateTimePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="location"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Ciudad / Provincia</FormLabel>
														<FormControl>
															<Input {...field} placeholder="Lima, Perú" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl h-12 focus:ring-orange-500/20" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="address"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Dirección del Local</FormLabel>
														<FormControl>
															<Input {...field} placeholder="Av. Principal 123" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl h-12 focus:ring-orange-500/20" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>

								{/* Columna Derecha: Multimedia y Estado (4/12) */}
								<div className="lg:col-span-5 space-y-8">
									{/* Sección: Imagen */}
									<div className="space-y-4">
										<div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
											<div className="p-2 bg-amber-500/10 rounded-lg">
												<ImageIcon className="w-5 h-5 text-amber-500" />
											</div>
											<h3 className="text-base font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Multimedia</h3>
										</div>

										<FormField
											control={form.control}
											name="coverImage"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Imagen de Portada</FormLabel>
													<FormControl>
														<div className="max-w-[320px] mx-auto lg:mx-0">
															<ImageUpload
																value={field.value}
																onChange={field.onChange}
																onRemove={() => field.onChange('')}
																disabled={isSubmitting}
															/>
														</div>
													</FormControl>
													<FormDescription className="text-[11px] text-slate-500 dark:text-slate-500 italic mt-2">
														Usa una imagen de alta calidad para destacar tu evento.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Sección: Estado */}
									<div className="space-y-4 pt-2">
										<div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
											<div className="p-2 bg-emerald-500/10 rounded-lg">
												<Save className="w-5 h-5 text-emerald-500" />
											</div>
											<h3 className="text-base font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Visibilidad</h3>
										</div>

										<FormField
											control={form.control}
											name="status"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-bold text-slate-700 dark:text-slate-300">Estado de Publicación</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger
																className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl h-12 focus:ring-orange-500/20">
																<SelectValue placeholder="Seleccionar estado" />
															</SelectTrigger>
														</FormControl>
														<SelectContent
															position="popper"
															sideOffset={4}
															className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-xl">
															<SelectItem value={EventStatus.DRAFT} className="py-3 font-medium">Borrador</SelectItem>
															<SelectItem value={EventStatus.PUBLISHED} className="py-3 font-medium text-emerald-600 dark:text-emerald-400">Publicado</SelectItem>
															<SelectItem value={EventStatus.CANCELLED} className="py-3 font-medium text-red-600 dark:text-red-400">Cancelado</SelectItem>
															<SelectItem value={EventStatus.COMPLETED} className="py-3 font-medium text-blue-600 dark:text-blue-400">Completado</SelectItem>
														</SelectContent>
													</Select>
													<FormDescription className="text-[11px] text-slate-500 dark:text-slate-500 italic mt-2">
														Controla si el evento es visible para los usuarios.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							</div>
						</ScrollArea>

						<div className="py-4 px-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex justify-end gap-4">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								className="rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 h-12 px-8 transition-all"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-10 h-12 shadow-xl shadow-orange-500/25 transition-all transform hover:scale-105 active:scale-95"
							>
								{isSubmitting ? (
									<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Guardando...</>
								) : (
									<><Save className="w-5 h-5 mr-2" /> {event ? 'Guardar Cambios' : 'Crear Evento'}</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
