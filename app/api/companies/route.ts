import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Company } from '@/models';
import { withAuth, withPermission } from '@/lib/middleware';
import { ApiResponse, JWTPayload, PERMISSIONS, UserRole } from '@/types';

// GET /api/companies - List all companies (SUPER_ADMIN only)
async function listCompaniesHandler(req: NextRequest, user: JWTPayload, _context: { params: Promise<any> }) {
  try {
    await connectDB();

    // Only SUPER_ADMIN can list all companies
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('isActive');

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List companies error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create new company (SUPER_ADMIN only)
async function createCompanyHandler(req: NextRequest, user: JWTPayload, _context: { params: Promise<any> }) {
  try {
    await connectDB();

    // Only SUPER_ADMIN can create companies
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, address, logo, website, taxId, settings } = body;

    if (!name || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if company with same email already exists
    const existingCompany = await Company.findOne({ email: email.toLowerCase() });
    if (existingCompany) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Company with this email already exists' },
        { status: 409 }
      );
    }

    const company = await Company.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      logo,
      website,
      taxId,
      settings: settings || {
        timezone: 'America/Lima',
        currency: 'PEN',
        language: 'es',
      },
      createdBy: user.userId,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: company,
        message: 'Company created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(listCompaniesHandler);
export const POST = withPermission(PERMISSIONS.COMPANY_CREATE, createCompanyHandler);
