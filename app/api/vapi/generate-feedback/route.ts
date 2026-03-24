import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/firebase/admin";
import OpenAI from "openai";
import { withAuth } from '@/lib/auth-middleware';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function handler(req: NextRequest, user: any) {
  const { questions, answers, interviewId } = await req.json();

  try {
    const prompt = `Provide constructive feedback on the following interview answers.

For EACH question:
- Highlight strengths
- Highlight areas for improvement
- Give a score out of 100

Also provide an overall summary.

Return ONLY JSON in this format:
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
  }
}

Questions: ${JSON.stringify(questions)}
Answers: ${JSON.stringify(answers)}
`;

    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const feedbackText =
      completion.choices[0]?.message?.content?.trim() || "";

    console.log("Raw Feedback Text:", feedbackText);

    // 🧠 CLEAN + SAFE PARSING
    let feedbackJson;

    try {
      const cleanedText = feedbackText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      feedbackJson = JSON.parse(cleanedText);
    } catch {
      // fallback: extract JSON manually
      const match = feedbackText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          feedbackJson = JSON.parse(match[0]);
        } catch {
          throw new Error("Invalid JSON from AI");
        }
      } else {
        throw new Error("No JSON found in AI response");
      }
    }

    console.log("Parsed Feedback JSON:", feedbackJson);

    // ✅ Save feedback
    await db.collection('interview_feedback').doc(interviewId).set({
      interviewId,
      feedback: feedbackJson,
      timestamp: new Date(),
    }, { merge: true });

    // ✅ Save answers + mark feedback given
    await db.collection('interviews').doc(interviewId).set({
      answers: answers,
      feedbackGiven: true,
    }, { merge: true });

    return NextResponse.json({
      success: true,
      feedback: feedbackJson,
    }, { status: 200 });

  } catch (err: any) {
    console.error("AI ERROR:", err?.message);

    return NextResponse.json({
      success: false,
      error: "Feedback generation failed",
    }, { status: 500 });
  }
}

export const POST = withAuth(handler);