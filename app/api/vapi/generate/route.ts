import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { request } from "http";
import { withAuth } from "@/lib/auth-middleware";




async function handler(req: NextRequest, user: any) {
  const {type,role,level,techStack,amount,userid,company} = await req.json();
    //change techstack from string seprated by space to single string seprated by comma
    const techStackArray = techStack[0].split(' ');
    console.log("Tech Stack Array:", techStackArray);

    try{
        const {text : questions} = await generateText({

            model : google('gemini-2.0-flash-001'),
            prompt : `Prepare questions for a job interview.
                        The job role is ${role}.
                        The job experience level is ${level}.
                        The tech stack used in the job is: ${techStack}.
                        The focus between behavioural and technical questions should lean towards: ${type}.
                        The amount of questions required is: ${amount}.
                        Please return only the questions, without any additional text.
                        Please dont ask directly to write code or program something. as they can only answer verbally.
                        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                        Return the questions formatted like this:
                        ["Question 1", "Question 2", "Question 3"]
                        
                        Thank you! <3
                    `,

        });

        const interview = {
            role,type,level,company,
            techStack : techStackArray,
            questions : JSON.parse(questions),
            userId : userid,
            finalized : true,
            coverImage : getRandomInterviewCover(company),
            createdAt : new Date().toISOString(),
            feedbackGiven : false
        }

        await db.collection('interviews').add(interview);
        return NextResponse.json({ success: true }, { status: 200 });

    }
    catch(err){
        console.log(err);
        return NextResponse.json({ success: false, error: err }, { status: 500 });

    }

}

export const POST = withAuth(handler)



