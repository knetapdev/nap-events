import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout successful',
    });

    // Clear auth cookie
    clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
