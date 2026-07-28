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
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Unable to generate interview at the moment.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      role,
      type,
      level,
      techStack,
      amount,
      userid,
      company,
    } = body;

    // ---------------- Validation ----------------

    if (
      !role ||
      !type ||
      !level ||
      !techStack ||
      !amount ||
      !userid
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    const techStackArray =
      typeof techStack === "string"
        ? techStack
            .split(/[,\s]+/)
            .filter(Boolean)
        : Array.isArray(techStack)
        ? techStack
        : [];

    const prompt = `
Prepare ${amount} interview questions.

Role: ${role}
Experience: ${level}
Company: ${company}
Focus: ${type}
Tech Stack: ${techStackArray.join(", ")}

Rules:

- Return ONLY a valid JSON array.
- No markdown.
- No explanation.
- No code block.
- Questions should be verbal interview questions.
- Do NOT ask the candidate to write code.
- Do NOT include special characters like *, /, or markdown.

Example:

[
  "Question 1",
  "Question 2",
  "Question 3"
]
`;

    console.log("Generating interview...");
    console.log({
      role,
      company,
      level,
      type,
      amount,
      techStack: techStackArray,
    });

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      temperature: 0.4,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Always return only valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("Model Used:", completion.model);

    const raw =
      completion.choices?.[0]?.message?.content?.trim() ?? "";

    console.log("Raw AI Response:");
    console.log(raw);

    let questions: string[] = [];

    try {
      questions = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);

      if (match) {
        questions = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Failed to parse AI response");
      console.log(raw);

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate interview questions. Please try again.",
        },
        { status: 500 }
      );
    }

    const interview = {
      role,
      type,
      level,
      company,
      techStack: techStackArray,
      questions,
      userId: userid,
      finalized: true,
      feedbackGiven: false,
      coverImage: getRandomInterviewCover(company),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection("interviews")
      .add(interview);

    console.log("Interview Saved:", docRef.id);

    return NextResponse.json(
      {
        success: true,
        message: "Interview generated successfully.",
        interviewId: docRef.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("========== OPENROUTER ERROR ==========");
    console.error(error);
    console.error("Message:", error?.message);
    console.error("Status:", error?.status);
    console.error("Code:", error?.code);
    console.error("======================================");

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while generating your interview. Please try again in a few moments.",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);