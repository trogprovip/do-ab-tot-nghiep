import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép truy cập trang đăng nhập admin mà không cần kiểm tra
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Kiểm tra tất cả các route admin khác
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    // Nếu không có token → chuyển về trang đăng nhập admin
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Parse JWT token để lấy thông tin user
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Kiểm tra role - CHỈ cho phép admin
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Token parsing failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Áp dụng cho tất cả route /admin/*
};
