import { db } from "@/firebase/admin";

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!' }, { status: 200 });
}

export async function POST(request: Request) {
    const { interviewId } = await request.json();
    console.log('Received interview id:', interviewId);

    try {
        // Fetch interview from database
        const interviewRef = db.collection('interviews').doc(String(interviewId));
        const interviewSnapshot = await interviewRef.get();

        // Check if document exists
        if (!interviewSnapshot.exists) {
            console.log('Interview not found for id:', interviewId);
            return Response.json({ 
                success: false, 
                message: 'Interview not found' 
            }, { status: 404 });
        }

        const interviewData = interviewSnapshot.data();
        console.log('Full interview data:', interviewData);

        const questionsData = interviewData?.questions || [];
        console.log('Fetched questions data:', questionsData);

        return Response.json({ 
            success: true, 
            data: questionsData 
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        return Response.json({ 
            success: false, 
            message: 'Failed to fetch questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}