import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      db: {
        schema: 'liauthority'
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname === '/'
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

  if (!user && (isDashboardPage || isOnboardingPage)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isDashboardPage) {
    // Check onboarding status
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    // If no profile exists yet or they aren't onboarded, send them to onboarding
    if (!profile || profile.onboarded === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  if (user && isOnboardingPage) {
    // If already onboarded, don't allow back to onboarding
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (profile && profile.onboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
