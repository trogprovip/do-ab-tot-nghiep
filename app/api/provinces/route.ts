import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.province_name = { contains: search };
    }

    const totalElements = await prisma.provinces.count({ where });

    const content = await prisma.provinces.findMany({
      where,
      skip,
      take: size,
      orderBy: { province_name: 'asc' },
    });

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { province_name } = body;

    if (!province_name) {
      return NextResponse.json(
        { error: 'Province name is required' },
        { status: 400 }
      );
    }

    await prisma.provinces.create({
      data: {
        province_name,
        is_deleted: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating province:', error);
    return NextResponse.json(
      { error: 'Failed to create province' },
      { status: 500 }
    );
  }
}