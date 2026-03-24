// lib/auth-middleware.ts (Create this file)
import { NextRequest, NextResponse } from 'next/server'

import { cookies } from 'next/headers'
import { auth } from '@/firebase/admin'

export async function verifySession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return {
        authenticated: false,
        error: 'No session found',
        status: 401
      }
    }

    // Verify session cookie with Firebase Admin
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    return {
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified
      }
    }
  } catch (error) {
    console.error('Session verification failed:', error)
    return {
      authenticated: false,
      error: 'Invalid or expired session',
      status: 401
    }
  }
}

// Higher-order function to protect routes
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await verifySession()

    if (!session.authenticated) {
      return NextResponse.json(
        { error: session.error },
        { status: session.status || 401 }
      )
    }

    // Pass user to the handler
    return handler(req, session.user)
  }
}

/*
  Firebase-based authentication middleware for Next.js App Router routes.

  1. verifySession():
     - Reads 'session' cookie from browser.
     - Verifies it with Firebase Admin SDK.
     - Returns either authenticated user info or an error.

  2. withAuth(handler):
     - Wraps API route handlers to protect them.
     - If no valid session, returns 401 response.
     - If session valid, passes `user` data to the handler.

  Usage:
     export const GET = withAuth(handler); in route.ts files
*/
