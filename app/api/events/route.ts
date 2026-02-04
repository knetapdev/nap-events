import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models';
import { withPermission } from '@/lib/middleware';
import { generateSlug } from '@/lib/utils';
import { ApiResponse, JWTPayload, PERMISSIONS, EventStatus, TicketType } from '@/types';

async function getEvents(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ startDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Event.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createEvent(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, description, location, address, startDate, endDate, coverImage, ticketConfigs } = body;

    if (!name || !description || !location || !startDate || !endDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name, description, location, start date and end date are required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);
    const existingEvent = await Event.findOne({ slug });
    const finalSlug = existingEvent ? `${slug}-${Date.now().toString(36)}` : slug;

    const defaultTicketConfigs = ticketConfigs || [
      {
        type: TicketType.FREE,
        name: 'Entrada Gratuita',
        price: 0,
        quantity: 100,
        sold: 0,
        maxPerUser: 2,
        isActive: true,
      },
      {
        type: TicketType.VIP,
        name: 'Entrada VIP',
        price: 50,
        quantity: 50,
        sold: 0,
        maxPerUser: 4,
        isActive: true,
      },
    ];

    const event = await Event.create({
      name,
      slug: finalSlug,
      description,
      location,
      address,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverImage,
      status: EventStatus.DRAFT,
      ticketConfigs: defaultTicketConfigs,
      createdBy: user.userId,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: event,
        message: 'Event created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = getEvents;
export const POST = withPermission(PERMISSIONS.EVENT_CREATE, createEvent);
