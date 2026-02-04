import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventAssignment, User, Event } from '@/models';
import { withEventAccess } from '@/lib/middleware';
import { ApiResponse, JWTPayload, PERMISSIONS, ROLE_PERMISSIONS, UserRole } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

async function createBulkAssignmentHandler(req: NextRequest, user: JWTPayload, eventId: string) {
  try {
    await connectDB();

    const body = await req.json();
    const { userIds, role } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User IDs array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Role is required' },
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

    // Verify all users exist and belong to the same company
    const targetUsers = await User.find({ _id: { $in: userIds } });

    if (targetUsers.length !== userIds.length) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Some users were not found' },
        { status: 404 }
      );
    }

    // Verify all users belong to same company (except for SUPER_ADMIN)
    if (user.role !== UserRole.SUPER_ADMIN) {
      const invalidUsers = targetUsers.filter(
        u => u.companyId.toString() !== user.companyId
      );
      if (invalidUsers.length > 0) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'All users must belong to the same company' },
          { status: 403 }
        );
      }
    }

    // Check for existing assignments
    const existingAssignments = await EventAssignment.find({
      userId: { $in: userIds },
      eventId
    });

    const existingUserIds = new Set(existingAssignments.map(a => a.userId.toString()));
    const newUserIds = userIds.filter((id: string) => !existingUserIds.has(id));

    if (newUserIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All selected users are already assigned to this event' },
        { status: 400 }
      );
    }

    const assignmentPermissions = ROLE_PERMISSIONS[validRole] || [];

    // Create assignments in bulk
    const assignmentsToCreate = newUserIds.map((userId: string) => ({
      userId,
      eventId,
      role: validRole,
      permissions: assignmentPermissions,
      assignedBy: user.userId,
      companyId: event.companyId,
    }));

    const createdAssignments = await EventAssignment.insertMany(assignmentsToCreate);

    // Populate the created assignments
    const populatedAssignments = await EventAssignment.find({
      _id: { $in: createdAssignments.map(a => a._id) }
    })
      .populate('userId', 'name email phone role')
      .populate('assignedBy', 'name email');

    const skippedCount = userIds.length - newUserIds.length;
    let message = `${newUserIds.length} usuario(s) asignado(s) exitosamente`;
    if (skippedCount > 0) {
      message += `. ${skippedCount} usuario(s) ya estaban asignados y fueron omitidos.`;
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          created: populatedAssignments,
          skipped: skippedCount,
          total: newUserIds.length,
        },
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bulk assignment error:', error);
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

  return createBulkAssignmentHandler(req, user, eventId);
});
