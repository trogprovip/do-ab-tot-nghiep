import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, phone, email, password, username } = body;

    if (!full_name || !email || !password || !username) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.accounts.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
        is_deleted: false,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { success: false, message: 'Email đã được sử dụng' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { success: false, message: 'Tên đăng nhập đã được sử dụng' },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.accounts.create({
      data: {
        username,
        password_hash: hashedPassword,
        email,
        phone: phone || null,
        full_name,
        role: 'user',
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi đăng ký' },
      { status: 500 }
    );
  }
}
