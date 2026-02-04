import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { EventStatus, TicketType, ITicketConfig } from '@/types';

export interface IEventDocument extends Document {
  name: string;
  slug: string;
  description: string;
  location: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string;
  status: EventStatus;
  ticketConfigs: ITicketConfig[];
  shareableLink: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(TicketType),
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPerUser: {
      type: Number,
      default: 10,
      min: 1,
    },
    saleStartDate: Date,
    saleEndDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    address: String,
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    coverImage: String,
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    ticketConfigs: [TicketConfigSchema],
    shareableLink: {
      type: String,
      unique: true,
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

EventSchema.index({ slug: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ shareableLink: 1 });

EventSchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (!this.shareableLink) {
    this.shareableLink = `${this.slug}-${Date.now().toString(36)}`;
  }
});

const Event: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);

export default Event;
