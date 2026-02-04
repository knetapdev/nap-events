import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { withPermission } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { ApiResponse, JWTPayload, PERMISSIONS, UserRole } from '@/types';

async function getUsersHandler(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    const isActive = url.searchParams.get('isActive');

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createUserHandler(req: NextRequest, user: JWTPayload) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      role: role || UserRole.USER,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withPermission(PERMISSIONS.USER_READ, getUsersHandler);
export const POST = withPermission(PERMISSIONS.USER_CREATE, createUserHandler);
