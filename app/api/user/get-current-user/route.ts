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