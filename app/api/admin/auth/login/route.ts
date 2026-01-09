import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu không được để trống' },
        { status: 400 }
      );
    }

    // Find admin user in database
    const admin = await prisma.accounts.findFirst({
      where: {
        email: email,
        role: 'admin',
        is_deleted: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        password_hash: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin.id,
        email: admin.email,
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password hash from response
    const { password_hash: _passwordHash, ...adminUser } = admin;

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: adminUser,
        token,
      },
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
}
