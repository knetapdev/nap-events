import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RegistrationLink, Ticket, Event } from '@/models';
import { generateQRCode } from '@/lib/utils';
import { ApiResponse, TicketStatus } from '@/types';

type RouteParams = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { code } = await params;

    const link = await RegistrationLink.findOne({ code, isActive: true })
      .populate({
        path: 'eventId',
        select: 'name description location startDate endDate coverImage status ticketConfigs',
      });

    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid or inactive registration link' },
        { status: 404 }
      );
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Registration link has expired' },
        { status: 400 }
      );
    }

    if (link.maxUses && link.usedCount >= link.maxUses) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Registration link has reached maximum uses' },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        event: link.eventId,
        ticketType: link.ticketType,
        remainingUses: link.maxUses ? link.maxUses - link.usedCount : null,
      },
    });
  } catch (error) {
    console.error('Get registration link error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { code } = await params;
    const body = await req.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const link = await RegistrationLink.findOne({ code, isActive: true });
    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid or inactive registration link' },
        { status: 404 }
      );
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Registration link has expired' },
        { status: 400 }
      );
    }

    if (link.maxUses && link.usedCount >= link.maxUses) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Registration link has reached maximum uses' },
        { status: 400 }
      );
    }

    const event = await Event.findById(link.eventId);
    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const ticketConfig = event.ticketConfigs.find((tc) => tc.type === link.ticketType);
    if (!ticketConfig || !ticketConfig.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket type is not available' },
        { status: 400 }
      );
    }

    if (ticketConfig.sold >= ticketConfig.quantity) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No tickets available' },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findOne({
      eventId: link.eventId,
      guestEmail: email.toLowerCase(),
      ticketType: link.ticketType,
    });

    if (existingTicket) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You have already registered with this email' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create({
      eventId: link.eventId,
      guestEmail: email.toLowerCase(),
      guestName: name,
      guestPhone: phone,
      ticketType: link.ticketType,
      status: TicketStatus.CONFIRMED,
      qrCode: generateQRCode(),
      price: ticketConfig.price,
      purchasedAt: new Date(),
    });

    await RegistrationLink.findByIdAndUpdate(link._id, {
      $inc: { usedCount: 1 },
    });

    await Event.findByIdAndUpdate(link.eventId, {
      $inc: { 'ticketConfigs.$[elem].sold': 1 },
    }, {
      arrayFilters: [{ 'elem.type': link.ticketType }],
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ticket: {
            id: ticket._id,
            qrCode: ticket.qrCode,
            ticketType: ticket.ticketType,
            guestName: ticket.guestName,
            guestEmail: ticket.guestEmail,
          },
          event: {
            name: event.name,
            startDate: event.startDate,
            location: event.location,
          },
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
