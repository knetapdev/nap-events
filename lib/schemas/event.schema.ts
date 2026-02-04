import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener mínimo 3 caracteres')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: z.string().optional(),
  location: z.string().min(2, 'La ubicación es requerida'),
  address: z.string().optional(),
  startDate: z.coerce.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  endDate: z.coerce.date({
    required_error: 'La fecha de fin es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  status: z.enum(['draft', 'published', 'cancelled'], {
    required_error: 'El estado es requerido',
  }),
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
