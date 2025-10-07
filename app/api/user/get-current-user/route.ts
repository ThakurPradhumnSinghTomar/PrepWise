//get current user

import { getCurrentUser } from "@/lib/actions/auth.action";


export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    return Response.json(currentUser, { status: 200 });
  } catch (error) {
    console.error("Error getting current user:", error);
    return Response.json({ error: "Failed to get current user" }, { status: 500 });
  }
}
