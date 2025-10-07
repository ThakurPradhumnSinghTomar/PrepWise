import { db } from "@/firebase/admin";
import { use } from "react";

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

async function handler(req: NextRequest, user: any) {
  const {userid} = await req.json(); 
    console.log('Received userid:', userid);
    
   
    try{
        // Simulate fetching interviews from a database
        const interviewsRef = db.collection('interviews');
        const snapshot = await interviewsRef.where('userId', '==', String(userid)).get();
        

        const interviewData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched interview data:', interviewData);


        return NextResponse.json({ success: true, data: interviewData }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch interviews' }, { status: 500 });
    }
}

export const POST = withAuth(handler);

