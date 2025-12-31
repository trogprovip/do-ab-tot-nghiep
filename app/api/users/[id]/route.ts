import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedUser = await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: {
        role: body.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật vai trò' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa tài khoản thành công',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa tài khoản' },
      { status: 500 }
    );
  }
}
