//here we fetch all interview_ids from firebase database present in feedback collection for all users
import { db } from "@/firebase/admin";

export async function GET() {
    try {
        const snapshot = await db.collection('interview_feedback').get();
        const interviewIds = snapshot.docs.map(doc => doc.id);
        return Response.json({ success: true, data: interviewIds }, { status: 200 });
    } catch (error) {
        console.error("Error fetching interview IDs:", error);
        return Response.json({ success: false, error: "Error fetching interview IDs." }, { status: 500 });
    }   
}