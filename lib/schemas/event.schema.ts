import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener mínimo 3 caracteres')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: z.string().optional(),
  location: z.string().min(2, 'La ubicación es requerida'),
  address: z.string().optional(),
  startDate: z.coerce.date({ message: 'La fecha de inicio es requerida' }),
  endDate: z.coerce.date({ message: 'La fecha de fin es requerida' }),
  status: z.enum(['draft', 'published', 'cancelled'], { message: 'El estado es requerido' }),
  coverImage: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
}).refine((data) => data.endDate > data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export const editEventSchema = createEventSchema.extend({
  _id: z.string(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EditEventInput = z.infer<typeof editEventSchema>;
