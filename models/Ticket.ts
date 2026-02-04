import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { TicketType, TicketStatus } from '@/types';

export interface ITicketDocument extends Document {
  eventId: Types.ObjectId;
  userId?: Types.ObjectId;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  ticketType: TicketType;
  status: TicketStatus;
  qrCode: string;
  checkInTime?: Date;
  checkedInBy?: Types.ObjectId;
  price: number;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    guestName: {
      type: String,
      trim: true,
    },
    guestPhone: {
      type: String,
      trim: true,
    },
    ticketType: {
      type: String,
      enum: Object.values(TicketType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.PENDING,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    checkInTime: Date,
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ eventId: 1 });
TicketSchema.index({ userId: 1 });
TicketSchema.index({ qrCode: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ guestEmail: 1 });

const Ticket: Model<ITicketDocument> =
  mongoose.models.Ticket || mongoose.model<ITicketDocument>('Ticket', TicketSchema);

export default Ticket;
