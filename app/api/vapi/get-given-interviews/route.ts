//here we fetch all interview_ids from firebase database present in feedback collection for all users
import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

async function handler(req: NextRequest, user: any) {
  
 try {
        const snapshot = await db.collection('interview_feedback').get();
        const interviewIds = snapshot.docs.map(doc => doc.id);
        return NextResponse.json({ success: true, data: interviewIds }, { status: 200 });
    } catch (error) {
        console.error("Error fetching interview IDs:", error);
        return NextResponse.json({ success: false, error: "Error fetching interview IDs." }, { status: 500 });
    }
}

export const GET = withAuth(handler);