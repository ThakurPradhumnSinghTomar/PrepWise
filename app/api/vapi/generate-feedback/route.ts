import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/firebase/admin";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { withAuth } from '@/lib/auth-middleware';


async function handler(req: NextRequest, user: any) {
  
const {questions, answers, interviewId } = await req.json();

    
    try{
        const {text: feedbackText } = await generateText({
            model : google('gemini-2.0-flash-001'),
            prompt : `Provide constructive feedback on the following interview answers. For Each question return Highlight strengths and areas for improvement and than a overall highlight strengths and areas for improvement with a score out of 100 in a json form and dont return anything else than json data as this is a api call.
                        the responsse should be in this format:
                        {
                            "overall": {
                                "strengths": [],
                                "areas_for_improvement": [],
                                "score": 0
                            },
                            
                            "question_1": {
                                    "strengths": [],
                                    "areas_for_improvement": [],
                                    "score": 0
                                },
                            "question_2": {
                                    "strengths": [],
                                    "areas_for_improvement": [],
                                    "score": 0
                                }
                            //and so on for each question
                            
                        }

                        questions were: ${JSON.stringify(questions)}.
                        The answers given were: ${JSON.stringify(answers)}.
                        Please return the feedback in a concise manner.                        Thank you! <3
                    `,
        });

        console.log("Raw Feedback Text:", feedbackText);

        // Parse the feedback string to JSON
        let feedbackJson;
        try {
            // Remove markdown code blocks if present (```json and ```)
            const cleanedText = feedbackText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            feedbackJson = JSON.parse(cleanedText);
            console.log("Parsed Feedback JSON:", feedbackJson);
        } catch (parseError) {
            console.error("Failed to parse feedback as JSON:", parseError);
            console.error("Feedback text was:", feedbackText);
            return NextResponse.json({ 
                success: false, 
                error: "Failed to parse AI response as JSON" 
            }, { status: 500 });
        }

        // Save the parsed JSON feedback to Firestore
        await db.collection('interview_feedback').doc(interviewId).set({
            interviewId,
            feedback: feedbackJson,  // Store as JSON object, not string
            timestamp: new Date(),
        }, { merge: true });

        console.log("Feedback saved to Firestore for interviewId:", interviewId);


        //save the answers to the interview document in interviews collection in firebase
        await db.collection('interviews').doc(interviewId).set({
            answers: answers,
            feedbackGiven: true,
        }, { merge: true });

        // Return response with parsed JSON
        return NextResponse.json({ 
            success: true, 
            feedback: feedbackJson 
        }, { status: 200 });

        console.log("Feedback process completed successfully.");
        console.log("answers:", answers);

    }
    catch(err){
        console.error("Error in get-feedback:", err);
        return NextResponse.json({ 
            success: false, 
            error: err instanceof Error ? err.message : "Unknown error" 
        }, { status: 500 });
    }
}

export const POST = withAuth(handler)
