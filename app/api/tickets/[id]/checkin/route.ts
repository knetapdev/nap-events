import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Ticket } from '@/models';
import { withPermission } from '@/lib/middleware';
import { ApiResponse, JWTPayload, PERMISSIONS, TicketStatus } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

async function checkInHandler(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const ticketId = pathParts[pathParts.indexOf('tickets') + 1];

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.status === TicketStatus.USED) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket has already been used' },
        { status: 400 }
      );
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket has been cancelled' },
        { status: 400 }
      );
    }

    if (ticket.status === TicketStatus.PENDING) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket payment is pending' },
        { status: 400 }
      );
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $set: {
          status: TicketStatus.USED,
          checkInTime: new Date(),
          checkedInBy: user.userId,
        },
      },
      { new: true }
    ).populate('userId', 'name email').populate('checkedInBy', 'name');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedTicket,
      message: 'Check-in successful',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withPermission(PERMISSIONS.TICKET_CHECKIN, checkInHandler);
