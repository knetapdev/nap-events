import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader, getAuthCookie, hasPermission } from './auth';
import { JWTPayload, Permission, ApiResponse, UserRole } from '@/types';
import connectDB from './db';
import { Event, EventAssignment } from '@/models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

export function withAuth<T extends RouteContext = RouteContext>(
  handler: (req: NextRequest, user: JWTPayload, context: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    // Try to get token from cookies first, then from header
    let token = getAuthCookie(req);

    if (!token) {
      const authHeader = req.headers.get('authorization');
      token = getTokenFromHeader(authHeader);
    }

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return handler(req, payload, context);
  };
}

export function withPermission<T extends RouteContext = RouteContext>(
  permission: Permission,
  handler: (req: NextRequest, user: JWTPayload, context: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (req: NextRequest, user: JWTPayload, context: T) => {
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, user, context);
  });
}

export function withPermissions<T extends RouteContext = RouteContext>(
  permissions: Permission[],
  handler: (req: NextRequest, user: JWTPayload, context: T) => Promise<NextResponse>,
  requireAll: boolean = false
) {
  return withAuth<T>(async (req: NextRequest, user: JWTPayload, context: T) => {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(user.role, p))
      : permissions.some((p) => hasPermission(user.role, p));

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, user, context);
  });
}

export function withEventAccess(
  handler: (req: NextRequest, user: JWTPayload, eventId: string) => Promise<NextResponse>
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      await connectDB();

      // Extract eventId from URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const eventsIndex = pathParts.indexOf('events');
      const eventId = eventsIndex !== -1 ? pathParts[eventsIndex + 1] : null;

      if (!eventId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Event ID not found in URL' },
          { status: 400 }
        );
      }

      // SUPER_ADMIN has access to everything
      if (user.role === UserRole.SUPER_ADMIN) {
        return handler(req, user, eventId);
      }

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Event not found' },
          { status: 404 }
        );
      }

      // ADMIN: Check if user is creator or assigned
      if (user.role === UserRole.ADMIN) {
        const isCreator = event.createdBy.toString() === user.userId;
        const isAssigned = await EventAssignment.exists({
          userId: user.userId,
          eventId: eventId,
        });

        if (isCreator || isAssigned) {
          return handler(req, user, eventId);
        }
      }

      // PROMOTER/STAFF: Check if assigned
      if (user.role === UserRole.PROMOTER || user.role === UserRole.STAFF) {
        const assignment = await EventAssignment.findOne({
          userId: user.userId,
          eventId: eventId,
        });

        if (assignment) {
          return handler(req, user, eventId);
        }
      }

      // If no access granted
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied to this event' },
        { status: 403 }
      );
    } catch (error) {
      console.error('Error in withEventAccess:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
