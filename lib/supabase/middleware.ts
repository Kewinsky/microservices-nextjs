import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Sprawdź token z cookie (z API Gateway)
  const authToken = request.cookies.get('auth_token')?.value

  // Jeśli jest token w cookie, sprawdź go przez Supabase
  let user = null
  if (authToken) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )
      
      // Weryfikuj token przez Supabase
      const { data, error } = await supabase.auth.getUser(authToken)
      if (!error && data?.user) {
        user = data.user
      }
    } catch (error) {
      console.warn('Błąd weryfikacji tokenu:', error)
    }
  }

  // Jeśli nie ma użytkownika i nie jesteśmy na stronie logowania/rejestracji, przekieruj
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
