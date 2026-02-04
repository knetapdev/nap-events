import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models';
import { withPermission } from '@/lib/middleware';
import { ApiResponse, JWTPayload, PERMISSIONS } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const event = await Event.findById(id).populate('createdBy', 'name email');

    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateEventHandler(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const { name, description, location, address, startDate, endDate, coverImage, status, ticketConfigs } = body;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (address !== undefined) updates.address = address;
    if (startDate !== undefined) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = new Date(endDate);
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (status !== undefined) updates.status = status;
    if (ticketConfigs !== undefined) updates.ticketConfigs = ticketConfigs;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteEventHandler(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withPermission(PERMISSIONS.EVENT_UPDATE, updateEventHandler);
export const DELETE = withPermission(PERMISSIONS.EVENT_DELETE, deleteEventHandler);
