import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const province = await prisma.provinces.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!province) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(province);
  } catch (error) {
    console.error('Error fetching province:', error);
    return NextResponse.json(
      { error: 'Failed to fetch province' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();

    const existingProvince = await prisma.provinces.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingProvince) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (body.province_name !== undefined) {
      updateData.province_name = body.province_name;
    }

    await prisma.provinces.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating province:', error);
    return NextResponse.json(
      { error: 'Failed to update province' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const existingProvince = await prisma.provinces.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingProvince) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }

    await prisma.provinces.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting province:', error);
    return NextResponse.json(
      { error: 'Failed to delete province' },
      { status: 500 }
    );
  }
}
