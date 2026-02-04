'use client';

import React, { useEffect, useState } from 'react';
import { useEvent } from '@/contexts/EventContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PERMISSIONS, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Plus,
	UserPlus,
	Trash2,
	Search,
	Users,
	Info,
	Calendar,
	ShieldCheck,
	AlertTriangle,
	Loader2,
	X
} from 'lucide-react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface EventAssignment {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
		role: UserRole;
	};
	eventId: string;
	role: UserRole;
	permissions: string[];
}

interface User {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
}

export default function AssignmentPage() {
	const { selectedEvent } = useEvent();
	const [assignments, setAssignments] = useState<EventAssignment[]>([]);
	const [allUsers, setAllUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState('');
	const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PROMOTER);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (selectedEvent) {
			loadAssignments();
			loadAllUsers();
		}
	}, [selectedEvent]);

	const loadAssignments = async () => {
		if (!selectedEvent) return;

		try {
			setIsLoading(true);
			const response = await fetch(`/api/events/${selectedEvent._id}/assignments`, {
				credentials: 'include',
			});

			const data = await response.json();

			if (response.ok && data.success) {
				setAssignments(data.data);
			} else {
				console.error('Error loading assignments:', data.error);
			}
		} catch (error) {
			console.error('Error loading assignments:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadAllUsers = async () => {
		try {
			const response = await fetch('/api/users?limit=100', {
				credentials: 'include',
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// Filter out users who are already assigned
				const assignedUserIds = assignments.map((a) => a.userId._id);
				const availableUsers = data.data.filter((u: User) => !assignedUserIds.includes(u._id));
				setAllUsers(availableUsers);
			}
		} catch (error) {
			console.error('Error loading users:', error);
		}
	};

	// Reload available users when assignments change
	useEffect(() => {
		if (selectedEvent && assignments.length >= 0) {
			loadAllUsers();
		}
	}, [assignments]);

	const handleAssignUser = async () => {
		if (!selectedEvent || !selectedUserId) {
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/events/${selectedEvent._id}/assignments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					userId: selectedUserId,
					role: selectedRole,
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				toast.success('Usuario asignado exitosamente');
				setShowAssignModal(false);
				setSelectedUserId('');
				loadAssignments();
			} else {
				toast.error(`Error: ${data.error || 'No se pudo asignar el usuario'}`);
			}
		} catch (error) {
			console.error('Error assigning user:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRemoveAssignment = async (assignmentId: string, userName: string) => {
		if (!confirm(`¿Estás seguro de que quieres remover a ${userName} de este evento?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/events/${selectedEvent?._id}/assignments/${assignmentId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			const data = await response.json();

			if (response.ok && data.success) {
				toast.success('Usuario removido del evento');
				loadAssignments();
			} else {
				toast.error(`Error: ${data.error || 'No se pudo remover el usuario'}`);
			}
		} catch (error) {
			console.error('Error removing assignment:', error);
		}
	};

	const getRoleBadge = (role: UserRole) => {
		const roleStyles = {
			[UserRole.SUPER_ADMIN]: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
			[UserRole.ADMIN]: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/20',
			[UserRole.PROMOTER]: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
			[UserRole.STAFF]: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20',
			[UserRole.USER]: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/20',
		};

		const roleLabels = {
			[UserRole.SUPER_ADMIN]: 'Super Admin',
			[UserRole.ADMIN]: 'Admin',
			[UserRole.PROMOTER]: 'Promotor',
			[UserRole.STAFF]: 'Staff',
			[UserRole.USER]: 'Invitado',
		};

		return (
			<Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleStyles[role]}`}>
				{roleLabels[role]}
			</Badge>
		);
	};

	if (!selectedEvent) {
		return (
			<ProtectedRoute requiredPermissions={[PERMISSIONS.USER_ASSIGN]}>
				<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 flex items-start gap-4">
					<AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0 mt-1" />
					<div>
						<h3 className="text-xl font-bold text-yellow-500 mb-2">No hay evento seleccionado</h3>
						<p className="text-slate-400">Por favor, selecciona un evento desde el panel lateral para gestionar las asignaciones.</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute requiredPermissions={[PERMISSIONS.USER_ASSIGN]}>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">Asignación de Usuarios</h1>
						<p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
							<Users className="w-4 h-4 text-orange-500 dark:text-orange-400" />
							Gestionando equipo para: <span className="text-orange-600 dark:text-orange-300 font-semibold">{selectedEvent.name}</span>
						</p>
					</div>
					<Button onClick={() => setShowAssignModal(true)} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-12 rounded-xl border-none transition-colors">
						<UserPlus className="w-5 h-5 mr-2" />
						Asignar Miembro
					</Button>
				</div>

				{/* Assignments List */}
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border-slate-200 dark:border-white/10">
						<Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
						<p className="text-slate-500 dark:text-slate-400 font-medium">Cargando equipo del evento...</p>
					</div>
				) : assignments.length === 0 ? (
					<Card className="glass-card border-slate-200 dark:border-white/10 border-dashed py-16 text-center rounded-3xl shadow-none">
						<CardContent className="space-y-6">
							<div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
								<Users className="w-10 h-10 text-slate-300 dark:text-slate-700" />
							</div>
							<div>
								<CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No hay equipo todavía</CardTitle>
								<CardDescription className="text-slate-500 dark:text-slate-500 max-w-sm mx-auto">Asigna promotores y personal para que te ayuden a gestionar el evento y las validaciones.</CardDescription>
							</div>
							<Button onClick={() => setShowAssignModal(true)} variant="outline" className="border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 px-8 rounded-xl font-bold">
								Empezar a Asignar
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{assignments.map((assignment) => (
							<Card
								key={assignment._id}
								className="glass-card border-slate-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 group rounded-3xl overflow-hidden shadow-sm dark:shadow-none"
							>
								<CardContent className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex items-center space-x-4">
											<Avatar className="w-14 h-14 border-2 border-slate-100 dark:border-white/5 ring-2 ring-orange-500/10 dark:ring-orange-500/20">
												<AvatarImage src="" />
												<AvatarFallback className="bg-primary text-white text-xl font-bold">
													{assignment.userId.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors uppercase tracking-tight">{assignment.userId.name}</h3>
												<p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[150px] font-medium">{assignment.userId.email}</p>
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveAssignment(assignment._id, assignment.userId.name)}
											className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>

									<Separator className="my-5 bg-slate-100 dark:bg-white/5" />

									<div className="flex items-center justify-between">
										<div className="flex flex-col gap-1">
											<span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Rol Evento</span>
											{getRoleBadge(assignment.role)}
										</div>
										<div className="flex flex-col gap-1 items-end">
											<span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Rol Global</span>
											{getRoleBadge(assignment.userId.role)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Assign User Modal */}
				<Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
					<DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl sm:max-w-[450px] transition-colors">
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold flex items-center gap-2">
								<UserPlus className="w-6 h-6 text-orange-500 dark:text-orange-400" />
								Asignar Miembro
							</DialogTitle>
							<DialogDescription className="text-slate-500 dark:text-slate-400 pt-2">
								Asigna a un usuario del sistema un rol específico para <strong className="text-orange-600 dark:text-orange-400">{selectedEvent.name}</strong>.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* User Select */}
							<div className="space-y-3">
								<label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
									<Plus className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Seleccionar Usuario
								</label>
								<Select
									value={selectedUserId}
									onValueChange={setSelectedUserId}
								>
									<SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:ring-orange-500/20">
										<SelectValue placeholder="Seleccionar un usuario" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-h-[250px] rounded-xl shadow-xl">
										{allUsers.length === 0 ? (
											<div className="p-4 text-center text-sm text-slate-500">No hay usuarios disponibles</div>
										) : (
											allUsers.map((user) => (
												<SelectItem
													key={user._id}
													value={user._id}
													className="focus:bg-primary focus:text-white py-3 cursor-pointer"
												>
													<div className="flex flex-col">
														<span className="font-medium">{user.name}</span>
														<span className="text-[10px] text-slate-400 uppercase">{user.email} • {user.role}</span>
													</div>
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{allUsers.length === 0 && (
									<p className="text-[10px] text-yellow-500 flex items-center gap-1 border border-yellow-500/20 bg-yellow-500/5 p-2 rounded-lg">
										<Info className="w-3 h-3" /> Todos los usuarios ya están asignados a este evento.
									</p>
								)}
							</div>

							{/* Role Select */}
							<div className="space-y-3">
								<label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
									<ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Rol en el Evento
								</label>
								<Select
									value={selectedRole}
									onValueChange={(val) => setSelectedRole(val as UserRole)}
								>
									<SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:ring-orange-500/20">
										<SelectValue placeholder="Seleccionar rol" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl">
										<SelectItem value={UserRole.PROMOTER} className="focus:bg-primary focus:text-white py-3 cursor-pointer">Promotor</SelectItem>
										<SelectItem value={UserRole.STAFF} className="focus:bg-primary focus:text-white py-3 cursor-pointer">Staff</SelectItem>
										<SelectItem value={UserRole.ADMIN} className="focus:bg-primary focus:text-white py-3 cursor-pointer">Administrador</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-[10px] text-slate-500 italic px-1">
									* Este rol aplicará exclusivamente para este evento y sus permisos.
								</p>
							</div>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowAssignModal(false)}
								className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 h-12 px-6 rounded-xl transition-colors"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleAssignUser}
								disabled={isSubmitting || !selectedUserId}
								className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl border-none shadow-lg shadow-orange-500/20"
							>
								{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
								Asignar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
