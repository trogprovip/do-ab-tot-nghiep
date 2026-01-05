/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy cấu hình theo type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      // Lấy 1 setting theo type
      const setting = await prisma.setting_system.findUnique({
        where: { type },
      });
      return NextResponse.json(setting);
    } else {
      // Lấy tất cả settings
      const settings = await prisma.setting_system.findMany();
      return NextResponse.json(settings);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Tạo hoặc cập nhật setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.config_data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, config_data' },
        { status: 400 }
      );
    }

    // Upsert: Tạo mới hoặc cập nhật nếu đã tồn tại
    const setting = await prisma.setting_system.upsert({
      where: { type: body.type },
      update: {
        config_data: body.config_data,
      },
      create: {
        type: body.type,
        config_data: body.config_data,
        create_at: new Date(),
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    await prisma.setting_system.delete({
      where: { type },
    });

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
