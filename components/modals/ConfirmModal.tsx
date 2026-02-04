'use client';

import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = 'Confirmar',
	cancelLabel = 'Cancelar',
	isLoading = false,
	variant = 'danger'
}: ConfirmModalProps) {

	const variantConfig = {
		danger: {
			icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
			bgIcon: 'bg-red-500/10',
			btnClass: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
			borderClass: 'border-red-500/20'
		},
		warning: {
			icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
			bgIcon: 'bg-yellow-500/10',
			btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/20',
			borderClass: 'border-yellow-500/20'
		},
		info: {
			icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
			bgIcon: 'bg-blue-500/10',
			btnClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20',
			borderClass: 'border-blue-500/20'
		}
	};

	const config = variantConfig[variant];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-white dark:bg-slate-900/95 border-slate-200 dark:border-white/10 glass-card backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl sm:max-w-[400px] p-0 overflow-hidden">
				<div className="p-6 space-y-6">
					<DialogHeader className="flex flex-row items-center text-center space-y-4">
						<div className={`w-14 h-12 ${config.bgIcon} rounded-2xl flex items-center justify-center border ${config.borderClass}`}>
							{config.icon}
						</div>
						<div className="space-y-2">
							<DialogTitle className="text-2xl font-bold tracking-tight">
								{title}
							</DialogTitle>
							<DialogDescription className="text-slate-400 text-base">
								{description}
							</DialogDescription>
						</div>
					</DialogHeader>

					<DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 h-12 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-all"
						>
							{cancelLabel}
						</Button>
						<Button
							type="button"
							onClick={onConfirm}
							disabled={isLoading}
							className={`flex-1 h-12 rounded-xl font-bold border-none transition-all active:scale-95 ${config.btnClass}`}
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin mr-2" />
									Procesando...
								</>
							) : (
								confirmLabel
							)}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
