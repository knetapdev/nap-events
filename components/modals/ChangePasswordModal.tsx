'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound } from "lucide-react";
import { IUser } from "@/types";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { toast } from 'sonner';

const passwordSchema = z.object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Debe confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
}

export const ChangePasswordModal = ({
    isOpen,
    onClose,
    user,
}: ChangePasswordModalProps) => {
    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: values.password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(`Contraseña de ${user.name} actualizada correctamente`);
                onClose();
                form.reset();
            } else {
                toast.error(`Error: ${data.error || 'No se pudo actualizar la contraseña'}`);
            }
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Error al actualizar la contraseña');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-slate-900/95 border-white/10 glass-card backdrop-blur-xl text-white rounded-3xl sm:max-w-[400px] p-0 overflow-hidden">
                <div className="p-6 space-y-6">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                            <KeyRound className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Cambiar Contraseña
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 text-base">
                                Estás cambiando la contraseña de <strong>{user?.name}</strong>.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 font-semibold">Nueva Contraseña</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-orange-500/20"
                                                placeholder="••••••••"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 font-semibold">Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-orange-500/20"
                                                placeholder="••••••••"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold transition-all"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="flex-1 h-12 rounded-xl font-bold btn-gradient border-none transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Cambiando...
                                        </>
                                    ) : (
                                        'Cambiar Password'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
