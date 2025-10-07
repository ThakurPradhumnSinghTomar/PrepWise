import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return new Response(
      JSON.stringify({ success: true, message: "Signed out successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Sign out failed.", error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    }
  }