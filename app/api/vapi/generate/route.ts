import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function handler(req: NextRequest, user: any) {
  const { type, role, level, techStack, amount, userid, company } =
    await req.json();

  const techStackArray = techStack[0].split(" ");
  console.log("Tech Stack Array:", techStackArray);

  try {
    const completion = await openai.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [
        {
          role: "user",
          content: `Prepare questions for a job interview.
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
Thank you!`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";

    // 🧠 SAFE PARSING (prevents crashes)
    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(raw);
    } catch {
      // fallback: try extracting array manually
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsedQuestions = JSON.parse(match[0]);
        } catch {
          parsedQuestions = [];
        }
      }
    }

    // 🧨 If still empty → fail gracefully
    if (!parsedQuestions.length) {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const interview = {
      role,
      type,
      level,
      company,
      techStack: techStackArray,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(company),
      createdAt: new Date().toISOString(),
      feedbackGiven: false,
    };

    await db.collection("interviews").add(interview);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("AI ERROR:", err?.message);

    return NextResponse.json(
      {
        success: false,
        error: "AI generation failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);