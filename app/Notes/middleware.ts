// middleware.ts (in your project root)
import { auth } from 'firebase-admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value

  // If no session cookie, return unauthorized
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized - No session found' },
      { status: 401 }
    )
  }
  try {
    // Verify the session cookie with Firebase Admin
    // Note: You'll need to import your Firebase Admin instance
    const { auth } = await import('firebase-admin') // Adjust path to your firebase-admin config
    
    // Verify session cookie
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true)
    
    // Optional: Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decodedClaims.uid)
    requestHeaders.set('x-user-email', decodedClaims.email || '')
    
    // Allow request to continue with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
  } catch (error) {
    // Session cookie is invalid or expired
    console.error('Session verification failed:', error)
    
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or expired session' },
      { status: 401 }
    )
  }
}

// Specify which routes need authentication
export const config = {
  matcher: [
    // Protect all API routes except auth-related ones
    '/api/((?!auth|login|register|public).*)',
    
    // Or be more specific:
    // '/api/protected/:path*',
    // '/api/user/:path*',
    // '/api/admin/:path*',
  ]
}