import React from "react";
import AudioController from "./AudioController";


export type answers = string[];

type QuestionProps = {
    question: string;
    answers: answers;
    setAnswers: React.Dispatch<React.SetStateAction<answers>>;
    questionId: number;
}

export const Question = ({ question, answers, setAnswers, questionId }: QuestionProps) => {

    console.log("Rendering Question:", questionId, question);

    
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-slate-900/50 rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
                {/* Question Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 border-b border-slate-700/50">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            Q
                        </div>
                        <h2 className="text-xl font-semibold text-white leading-relaxed">
                            {question}
                        </h2>
                    </div>
                </div>

                {/* Audio Controller Section */}
                <div className="p-6 bg-slate-900/30">
                    <AudioController answers={answers} setAnswers={setAnswers} questionId={questionId} />
                </div>
            </div>
        </div>
    );
}