import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { withPermission } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { ApiResponse, JWTPayload, PERMISSIONS, UserRole } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

// GET single user
async function getUserHandler(
    req: NextRequest,
    authUser: JWTPayload,
    context: RouteContext
) {
    try {
        await connectDB();

        const { id } = await context.params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// UPDATE user
async function updateUserHandler(
    req: NextRequest,
    authUser: JWTPayload,
    context: RouteContext
) {
    try {
        await connectDB();

        const { id } = await context.params;
        const body = await req.json();
        const { email, password, name, phone, role, isActive } = body;

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is being changed and if it's already in use
        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Email already in use' },
                    { status: 400 }
                );
            }
            user.email = email.toLowerCase();
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (role && Object.values(UserRole).includes(role)) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        // Update password if provided
        if (password && password.length >= 6) {
            user.password = await hashPassword(password);
        }

        await user.save();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
            },
            message: 'User updated successfully',
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE user (soft delete - just deactivate)
async function deleteUserHandler(
    req: NextRequest,
    authUser: JWTPayload,
    context: RouteContext
) {
    try {
        await connectDB();

        const { id } = await context.params;
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent deleting yourself
        if (user._id.toString() === authUser.userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Cannot delete yourself' },
                { status: 400 }
            );
        }

        user.isActive = false;
        await user.save();

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'User deactivated successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const GET = withPermission<RouteContext>(PERMISSIONS.USER_READ, getUserHandler);
export const PUT = withPermission<RouteContext>(PERMISSIONS.USER_UPDATE, updateUserHandler);
export const DELETE = withPermission<RouteContext>(PERMISSIONS.USER_DELETE, deleteUserHandler);
