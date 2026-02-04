import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventAssignment } from '@/models';
import { withAuth } from '@/lib/middleware';
import { JWTPayload, UserRole, ApiResponse } from '@/types';

export const GET = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    await connectDB();

    let events = [];

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        // SUPER_ADMIN sees all events
        events = await Event.find()
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .lean();
        break;

      case UserRole.ADMIN:
        // ADMIN sees created events + assigned events
        const createdEvents = await Event.find({ createdBy: user.userId })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .lean();

        const adminAssignments = await EventAssignment.find({ userId: user.userId }).lean();
        const assignedEventIds = adminAssignments.map((a) => a.eventId.toString());

        const assignedEvents = await Event.find({
          _id: { $in: assignedEventIds },
        })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .lean();

        // Merge and remove duplicates
        const eventMap = new Map();
        [...createdEvents, ...assignedEvents].forEach((event) => {
          eventMap.set(event._id.toString(), event);
        });
        events = Array.from(eventMap.values());
        break;

      case UserRole.PROMOTER:
      case UserRole.STAFF:
        // PROMOTER/STAFF only see assigned events
        const userAssignments = await EventAssignment.find({ userId: user.userId }).lean();
        const userEventIds = userAssignments.map((a) => a.eventId.toString());

        events = await Event.find({
          _id: { $in: userEventIds },
        })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .lean();
        break;

      default:
        events = [];
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
