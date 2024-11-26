import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Cek jika request menuju ke rute admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Kecualikan halaman login admin
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }

    // Cek apakah ada data admin di localStorage
    const hasAdminData = request.cookies.get('admin');

    // Jika tidak ada data admin, redirect ke halaman login
    if (!hasAdminData) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang akan diproteksi
export const config = {
  matcher: [
    // Lindungi semua rute yang dimulai dengan /admin
    '/admin/:path*',
  ],
}; 