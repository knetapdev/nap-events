import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { UserRole } from '@/types';

export interface IEventAssignmentDocument extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  role: UserRole;
  permissions: string[];
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventAssignmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    permissions: [{
      type: String,
    }],
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EventAssignmentSchema.index({ userId: 1, eventId: 1 }, { unique: true });
EventAssignmentSchema.index({ eventId: 1 });
EventAssignmentSchema.index({ userId: 1 });

const EventAssignment: Model<IEventAssignmentDocument> =
  mongoose.models.EventAssignment ||
  mongoose.model<IEventAssignmentDocument>('EventAssignment', EventAssignmentSchema);

export default EventAssignment;
