import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { TicketType } from '@/types';

export interface IRegistrationLinkDocument extends Document {
  eventId: Types.ObjectId;
  code: string;
  ticketType: TicketType;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationLinkSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    ticketType: {
      type: String,
      enum: Object.values(TicketType),
      required: true,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

RegistrationLinkSchema.index({ code: 1 });
RegistrationLinkSchema.index({ eventId: 1 });
RegistrationLinkSchema.index({ isActive: 1 });

const RegistrationLink: Model<IRegistrationLinkDocument> =
  mongoose.models.RegistrationLink ||
  mongoose.model<IRegistrationLinkDocument>('RegistrationLink', RegistrationLinkSchema);

export default RegistrationLink;
