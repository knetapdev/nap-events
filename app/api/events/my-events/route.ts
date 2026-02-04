import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventAssignment } from '@/models';
import { withAuth } from '@/lib/middleware';
import { JWTPayload, UserRole, ApiResponse } from '@/types';

export const GET = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    await connectDB();

    // Get companyId from query params (for SUPER_ADMIN filtering)
    const url = new URL(req.url);
    const requestedCompanyId = url.searchParams.get('companyId');

    let events = [];

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        // SUPER_ADMIN can filter by specific company or see all
        const superAdminQuery = requestedCompanyId
          ? { companyId: requestedCompanyId }
          : {};

        events = await Event.find(superAdminQuery)
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .populate('companyId', 'name slug')
          .lean();
        break;

      case UserRole.ADMIN:
        // ADMIN sees created events + assigned events within their company
        const createdEvents = await Event.find({
          createdBy: user.userId,
          companyId: user.companyId,
        })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .populate('companyId', 'name slug')
          .lean();

        const adminAssignments = await EventAssignment.find({
          userId: user.userId,
          companyId: user.companyId,
        }).lean();
        const assignedEventIds = adminAssignments.map((a) => a.eventId.toString());

        const assignedEvents = await Event.find({
          _id: { $in: assignedEventIds },
          companyId: user.companyId,
        })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .populate('companyId', 'name slug')
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
        // PROMOTER/STAFF only see assigned events within their company
        const userAssignments = await EventAssignment.find({
          userId: user.userId,
          companyId: user.companyId,
        }).lean();
        const userEventIds = userAssignments.map((a) => a.eventId.toString());

        events = await Event.find({
          _id: { $in: userEventIds },
          companyId: user.companyId,
        })
          .sort({ startDate: -1 })
          .populate('createdBy', 'name email')
          .populate('companyId', 'name slug')
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
