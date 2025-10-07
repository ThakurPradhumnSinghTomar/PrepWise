import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

async function handler(req: NextRequest, user: any) {
  const { interviewId } = await req.json();
    console.log('Received interview id:', interviewId);

    try {
        // Fetch interview from database
        const interviewRef = db.collection('interviews').doc(String(interviewId));
        const interviewSnapshot = await interviewRef.get();

        // Check if document exists
        if (!interviewSnapshot.exists) {
            console.log('Interview not found for id:', interviewId);
            return NextResponse.json({ 
                success: false, 
                message: 'Interview not found' 
            }, { status: 404 });
        }

        const interviewData = interviewSnapshot.data();
        console.log('Full interview data:', interviewData);

        const questionsData = interviewData?.questions || [];
        console.log('Fetched questions data:', questionsData);

        return NextResponse.json({ 
            success: true, 
            data: questionsData 
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export const POST = withAuth(handler);

