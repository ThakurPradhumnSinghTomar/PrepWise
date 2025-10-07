import { db } from "@/firebase/admin";
import { use } from "react";

export async function GET() {
    return Response.json({ success: true , data : 'THANK YOU!'}, { status: 200 });
}

export async function POST(request: Request) {
    const {userid} = await request.json(); 
    console.log('Received userid:', userid);
    
   
    try{
        // Simulate fetching interviews from a database
        const interviewsRef = db.collection('interviews');
        const snapshot = await interviewsRef.where('userId', '==', String(userid)).get();
        

        const interviewData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched interview data:', interviewData);


        return Response.json({ success: true, data: interviewData }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        return Response.json({ success: false, message: 'Failed to fetch interviews' }, { status: 500 });
    }
}