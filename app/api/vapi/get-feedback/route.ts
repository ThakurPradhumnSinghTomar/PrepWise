//this route fetch feedback from firebase database based on interviewid and return it
import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

async function handler(req: NextRequest, user: any) {
  const { interviewId } = await req.json();
    try {
        const doc = await db.collection('interview_feedback').doc(interviewId).get();
        if (!doc.exists) {
            return NextResponse.json({ success: false, error: "No feedback found for this interview." }, { status: 404 });
        }
        const data = doc.data();
        return NextResponse.json({ success: true, data: data?.feedback || null }, { status: 200 });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json({ success: false, error: "Error fetching feedback." }, { status: 500 });
    }

}

export const POST = withAuth(handler)


      
