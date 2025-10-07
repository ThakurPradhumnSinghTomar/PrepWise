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