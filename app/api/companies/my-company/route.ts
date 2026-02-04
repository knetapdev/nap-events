import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Company } from '@/models';
import { withAuth } from '@/lib/middleware';
import { ApiResponse, JWTPayload } from '@/types';

// GET /api/companies/my-company - Get current user's company
async function handler(req: NextRequest, user: JWTPayload, _context: { params: Promise<any> }) {
  try {
    await connectDB();

    const company = await Company.findById(user.companyId)
      .populate('createdBy', 'name email')
      .lean();

    if (!company) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Get my company error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
