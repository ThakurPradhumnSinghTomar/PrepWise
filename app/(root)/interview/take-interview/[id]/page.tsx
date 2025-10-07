'use client'
import {answers, Question} from '@/components/Question'
import React from 'react'
import { set } from 'zod';

type QuestionType = {
  id?: string;
  text: string;
  // Add other properties based on your actual question structure
}

const TakeInterviewPage = ({params}: {params: Promise<{id: string}>}) => {
    const [questions, setQuestions] = React.useState<QuestionType[]>([]);
    const [answers,setAnswers] = React.useState<answers>([]);
    const [isFeedbackGenerated, setIsFeedbackGenerated] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const { id } = React.use(params);

    if(questions.length === answers.length && questions.length > 0 && !isFeedbackGenerated){
        setIsFeedbackGenerated(true);
    }



    React.useEffect(() => {
    console.log("Answers updated:", answers);
    
      }, [answers]);

    async function getFeedback() {
        //first check if all questions are answered 
        if(answers.length !== questions.length){
            alert("Please answer all questions before submitting.");
            return;
        }

        try{
            setLoading(true);
            const res = await fetch('/api/vapi/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, questions, interviewId: id }),
            });

            const data = await res.json();
            if(data.success){
               //redirect to home page
                window.location.href = '/';
            }
            else{
                alert("Error getting feedback: " + (data.error || "Unknown error"));
            }
            setLoading(false);
        }
        catch(err){
            console.error("Error getting feedback:", err);
        }
    }
    
    React.useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const res = await fetch('/api/vapi/get-all-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interviewId: id }),
                    
                });
                const data = await res.json();
                if (data.success) {
                    setQuestions(data.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        }
        fetchQuestions();
    }, [id]);

    
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white mb-3">Interview Questions</h1>
                    <p className="text-slate-400 text-lg">Answer each question by recording your response</p>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                    {questions.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-slate-400 text-lg">Loading questions...</p>
                        </div>
                    ) : (
                        questions.map((question, index) => (
                            <div key={index} className="transform transition-all duration-300 hover:scale-[1.01]">
                                {/* Question Number Badge */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                                        Question {index + 1} of {questions.length}
                                    </div>
                                </div>
                                
                                <Question 
                                    question={typeof question === 'string' ? question : question.text}
                                    answers={answers}
                                    setAnswers={setAnswers}
                                    questionId={index}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section */}
                {questions.length > 0 && (
                    <div className="mt-16 text-center">
                        <div className="inline-block bg-slate-900/50 border border-slate-700/50 rounded-lg px-6 py-4">
                            <p className="text-slate-300 text-sm">
                                💡 <span className="font-semibold">Tip:</span> Take your time and speak clearly for best results
                            </p>
                        </div>
                    </div>
                )}

                {questions.length > 0 && (
                    <div className="mt-10 text-center">
                        <button 
                            className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all duration-200 hover:scale-103 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                            onClick={getFeedback} 
                            disabled={!isFeedbackGenerated || loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Loading...
                                </span>
                            ) : (
                                "Submit Answers"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TakeInterviewPage