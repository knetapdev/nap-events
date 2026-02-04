import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Company } from '@/models';
import { withCompanyAccess } from '@/lib/middleware';
import { ApiResponse, JWTPayload } from '@/types';

// GET /api/companies/[id] - Get company by ID
async function getCompanyHandler(req: NextRequest, user: JWTPayload, companyId: string) {
  try {
    await connectDB();

    const company = await Company.findById(companyId)
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
    console.error('Get company error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Update company
async function updateCompanyHandler(req: NextRequest, user: JWTPayload, companyId: string) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone, address, logo, website, taxId, isActive, settings } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (logo !== undefined) updateData.logo = logo;
    if (website !== undefined) updateData.website = website;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (settings !== undefined) updateData.settings = settings;

    // If email is being changed, check uniqueness
    if (email) {
      const existingCompany = await Company.findOne({
        email: email.toLowerCase(),
        _id: { $ne: companyId },
      });
      if (existingCompany) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Company with this email already exists' },
          { status: 409 }
        );
      }
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
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
      message: 'Company updated successfully',
    });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withCompanyAccess(getCompanyHandler);
export const PUT = withCompanyAccess(updateCompanyHandler);
