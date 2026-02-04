import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { withAuth } from '@/lib/middleware';
import { ApiResponse, JWTPayload } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: NextRequest, user: JWTPayload, _context: { params: Promise<any> }) {
  try {
    await connectDB();

    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        phone: dbUser.phone,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
