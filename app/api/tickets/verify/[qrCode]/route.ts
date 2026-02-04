import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Ticket, Event } from '@/models';
import { ApiResponse } from '@/types';

type RouteParams = { params: Promise<{ qrCode: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { qrCode } = await params;

    const ticket = await Ticket.findOne({ qrCode })
      .populate('userId', 'name email phone')
      .populate('eventId', 'name startDate endDate location');

    if (!ticket) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ticket: {
          id: ticket._id,
          ticketType: ticket.ticketType,
          status: ticket.status,
          guestName: ticket.guestName,
          guestEmail: ticket.guestEmail,
          checkInTime: ticket.checkInTime,
        },
        user: ticket.userId,
        event: ticket.eventId,
      },
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
