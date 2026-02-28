import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0], // Show a masked bit
    });
}
