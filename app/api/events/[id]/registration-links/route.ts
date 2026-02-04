import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RegistrationLink, Event } from '@/models';
import { withEventAccess } from '@/lib/middleware';
import { generateShareableCode } from '@/lib/utils';
import { ApiResponse, JWTPayload, PERMISSIONS } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

    const links = await RegistrationLink.find({ eventId: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: links,
    });
  } catch (error) {
    console.error('Get registration links error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createLinkHandler(req: NextRequest, user: JWTPayload, eventId: string) {
  try {
    await connectDB();

    const body = await req.json();
    const { ticketType, maxUses, expiresAt } = body;

    if (!ticketType) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket type is required' },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const ticketConfig = event.ticketConfigs.find((tc) => tc.type === ticketType);
    if (!ticketConfig) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid ticket type for this event' },
        { status: 400 }
      );
    }

    const linkData: Record<string, unknown> = {
      eventId,
      code: generateShareableCode(10),
      ticketType,
      createdBy: user.userId,
      companyId: event.companyId,
    };
    if (maxUses) linkData.maxUses = maxUses;
    if (expiresAt) linkData.expiresAt = new Date(expiresAt);

    const link = await RegistrationLink.create(linkData);

    const populatedLink = await RegistrationLink.findById(link._id)
      .populate('createdBy', 'name email');

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: populatedLink,
        message: 'Registration link created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create registration link error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withEventAccess(async (req: NextRequest, user: JWTPayload, eventId: string) => {
  // Check permission
  const { hasPermission } = await import('@/lib/auth');
  if (!hasPermission(user.role, PERMISSIONS.TICKET_CREATE)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return createLinkHandler(req, user, eventId);
});
