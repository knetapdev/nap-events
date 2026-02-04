import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventAssignment, User, Event } from '@/models';
import { withEventAccess } from '@/lib/middleware';
import { ApiResponse, JWTPayload, PERMISSIONS, ROLE_PERMISSIONS, UserRole } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const url = new URL(req.url);

    const companyId = url.searchParams.get('companyId') || '';

    const assignments = await EventAssignment.find({ eventId: id, companyId })
      .populate('userId', 'name email phone role')
      .populate('assignedBy', 'name email');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createAssignmentHandler(req: NextRequest, user: JWTPayload, eventId: string) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, role, permissions } = body;

    if (!userId || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const validRole = role as UserRole;

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify targetUser belongs to same company (except for SUPER_ADMIN)
    if (user.role !== UserRole.SUPER_ADMIN && targetUser.companyId.toString() !== user.companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User must belong to the same company' },
        { status: 403 }
      );
    }

    const existingAssignment = await EventAssignment.findOne({ userId, eventId });
    if (existingAssignment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User is already assigned to this event' },
        { status: 400 }
      );
    }

    const assignmentPermissions = permissions || ROLE_PERMISSIONS[validRole] || [];

    const assignment = await EventAssignment.create({
      userId,
      eventId,
      role: validRole,
      permissions: assignmentPermissions,
      assignedBy: user.userId,
      companyId: event.companyId,
    });

    const populatedAssignment = await EventAssignment.findById(assignment._id)
      .populate('userId', 'name email phone role')
      .populate('assignedBy', 'name email');

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: populatedAssignment,
        message: 'User assigned to event successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withEventAccess(async (req: NextRequest, user: JWTPayload, eventId: string) => {
  // Check permission
  const { hasPermission } = await import('@/lib/auth');
  if (!hasPermission(user.role, PERMISSIONS.USER_ASSIGN)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return createAssignmentHandler(req, user, eventId);
});
