import { withAuth } from "@/lib/auth-middleware";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, user: any) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json(
      { success: true, message: "Signed out successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Sign out failed.", error: (error as Error).message },
      { status: 500 }
    );
    }
}

export const POST = withAuth(handler)

  