//get current user

import { getCurrentUser } from "@/lib/actions/auth.action";
import { withAuth } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";


async function handler(req: NextRequest, user: any){
  try {
    const currentUser = await getCurrentUser();
    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 });
  }
}

export const GET = withAuth(handler)

/*

Normal method to write route.ts without this withAuth is : 

export async function GET(req: NextRequest) { ... }
export async function POST(req: NextRequest) { ... }

*/

/*

✅ You’re exporting your GET route handler function,
but instead of directly using GET(req),
you’re wrapping your handler with withAuth to add authentication logic.

So basically:

handler = the actual logic for getting the current user.

withAuth(handler) = a wrapper that ensures the user is authenticated before running your handler.

*/

/*

withAuth is a custom middleware function you (or your team) made in your project —
likely defined in @/lib/auth-middleware.ts.

Its job is usually to:

Check if the request has a valid authentication token (JWT, cookie, session, etc.)

Decode the user info.

If valid, pass the user data to your route handler (handler(req, user)).

If not valid, return an error or redirect.

*/