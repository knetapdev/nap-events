import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, Ticket } from '@/models';
import { withEventAccess, withPermission } from '@/lib/middleware';
import { generateQRCode } from '@/lib/utils';
import { ApiResponse, JWTPayload, PERMISSIONS, TicketStatus } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status');
    const ticketType = url.searchParams.get('ticketType');

    const query: Record<string, unknown> = { eventId: id };
    if (status) query.status = status;
    if (ticketType) query.ticketType = ticketType;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('checkedInBy', 'name'),
      Ticket.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createTicketHandler(req: NextRequest, user: JWTPayload, eventId: string) {
  try {
    await connectDB();

    const body = await req.json();
    const { ticketType, guestEmail, guestName, guestPhone, userId, quantity = 1 } = body;

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
        { success: false, error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    if (!ticketConfig.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'This ticket type is not available' },
        { status: 400 }
      );
    }

    if (ticketConfig.sold + quantity > ticketConfig.quantity) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await Ticket.create({
        eventId,
        userId: userId || null,
        guestEmail,
        guestName,
        guestPhone,
        ticketType,
        status: ticketConfig.price === 0 ? TicketStatus.CONFIRMED : TicketStatus.PENDING,
        qrCode: generateQRCode(),
        price: ticketConfig.price,
        purchasedAt: new Date(),
      });
      tickets.push(ticket);
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { 'ticketConfigs.$[elem].sold': quantity },
    }, {
      arrayFilters: [{ 'elem.type': ticketType }],
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: tickets.length === 1 ? tickets[0] : tickets,
        message: `${quantity} ticket(s) created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create ticket error:', error);
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

  return createTicketHandler(req, user, eventId);
});
