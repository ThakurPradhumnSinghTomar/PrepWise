'use client'

import { feedback } from '@/components/InterviewCard'
import { Interview } from '@/types'
import { User, TrendingUp, AlertCircle, Award, ChevronRight } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

const ShowFeedbackPage = () => {
    const [feedback, setFeedback] = React.useState<feedback | null>(null);
    const [interview, setInterview] = React.useState<Interview | null>(null);
    const [userId, setUserId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [interviewId, setInterviewId] = React.useState<string | null>(null);
    const params = useParams();

    React.useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/user/get-current-user');
                const user = await res.json();
                
                if (user && user.id) {
                    setUserId(user.id);
                } else {
                    toast.error('User not logged in');
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error('Failed to fetch user');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchUser();
    }, []);

    React.useEffect(() => {
        async function fetchInterviews() {
            try {
                const response = await fetch('/api/vapi/get-all-interviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userid: userId }),
                });
                const data = await response.json();
                
                console.log("API response:", data);

                if (data.success) {
                    const interviews = data.data;
                    const filteredInterview = interviews.find((interview: Interview) => interview.id === interviewId);

                    if (filteredInterview) {
                        setInterview(filteredInterview);
                    } else {
                        console.log('Interview not found');
                    }
                }
            } catch (error) {
                console.error("Error fetching interviews:", error);
            }
        }

        fetchInterviews();
    }, [userId, interviewId]);

    React.useEffect(() => {
        async function fetchInterviewId() {
            try {
                const id = params?.['interview-id'];
                setInterviewId(id as string);
            } catch (error) {
                console.error("Error fetching interview ID:", error);
            }
        }
        fetchInterviewId();
    }, []);

    React.useEffect(() => {
        async function fetchFeedback() {
            if (interviewId) {
                try {
                    const response = await fetch(`/api/vapi/get-feedback`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ interviewId }),
                    });
                    const data = await response.json();

                    if (data.success) {
                        setFeedback(data.data);
                    } else {
                        toast.error('Failed to fetch feedback');
                    }
                } catch (error) {
                    console.error("Error fetching feedback:", error);
                    toast.error('Failed to fetch feedback');
                }
            }
        }

        fetchFeedback();
    }, [interview, interviewId]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3'>
                      {/* 
                        bg-clip-text
                          Clips the background to only show within the text characters
                          Makes the background only visible where there's actual text

                        text-transparent
                          Makes the text color transparent
                          Allows the clipped background to show through

                        Combined Effect:
                          The text appears to have a colorful background that is only visible where the text is, creating a visually striking effect.

                      */}
                        Your Interview Feedback
                    </h1>
                    <p className='text-slate-400 text-lg'>Detailed analysis of your performance</p>
                </div>

                {/* Questions & Answers Section */}
                <div className='space-y-6 mb-12'>
                    {interview && interview.questions.map((question, index) => (
                        <div 
                            key={index} 
                            className='bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-slate-600/50'>    
                            {/* backdrop-blur-xl is a Tailwind CSS class that creates a blur effect on the background behind an element. */}
                            {/* Question & Answer */}
                            <div className='p-6 md:p-8'>
                                {/* Question */}
                                <div className='mb-6'>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            Q{index + 1}
                                        </div>
                                        <div className='flex-1'>
                                            <h2 className='text-xl md:text-2xl font-semibold text-white leading-relaxed'>
                                                {question}?
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer */}
                                <div className='mb-8'>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            A
                                        </div>
                                        {/*  
                                        
                                        flex-shrink-0 is a Tailwind CSS class that prevents a flex item from shrinking.

                                          What it does:
                                          Sets flex-shrink: 0 in CSS
                                          Prevents the element from getting smaller when the flex container runs out of space
                                          Maintains the element's original size regardless of available space
                                          Why use it:
                                          In your code, it's applied to the circular "Q1", "A" buttons:

                                          Without flex-shrink-0: The 40px × 40px circle could get compressed/smaller when text is very long With flex-shrink-0: The circle stays exactly 40px × 40px no matter what
                                        
                                        */}

                                        <div className='flex-1 bg-slate-900/40 rounded-xl p-4 border border-slate-700/30'>
                                            <p className='text-slate-300 leading-relaxed'>
                                                {interview?.answers 
                                                    ? (() => {
                                                        const answer = interview.answers.find((answer: string) => 
                                                            answer.startsWith(`Answer of ${index} question is`)
                                                        );
                                                        return answer 
                                                            ? answer.replace(`Answer of ${index} question is :`, '').trim()
                                                            : 'No answer provided';
                                                    })()
                                                    : 'No answer provided'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/*  
                                
                                leading-relaxed is a Tailwind CSS class that controls line height (spacing between lines of text).

                                  What it does:
                                  Sets line-height: 1.625 in CSS
                                  Creates relaxed spacing between lines of text
                                  Makes text more readable and easier to scan
                                  Line height options:
                                  leading-none → Very tight (1.0)
                                  leading-tight → Tight (1.25)
                                  leading-normal → Normal (1.5) - default
                                  leading-relaxed → Relaxed (1.625) ✅
                                  leading-loose → Very loose (2.0)

                                */}

                                {/* Feedback Section */}
                                {feedback && feedback[`question_${index+1}`] && (
                                    <div className='space-y-6 pt-6 border-t border-slate-700/50'>
                                        {/* Strengths */}
                                        {feedback[`question_${index+1}`]?.strengths?.length > 0 && (
                                            <div className='bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20'>
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <Award className='w-5 h-5 text-emerald-400' />
                                                    <h3 className='text-lg font-semibold text-emerald-400'>Strengths</h3>
                                                </div>
                                                <ul className='space-y-2'>
                                                    {feedback[`question_${index+1}`]?.strengths?.map((area: string, i: number) => (
                                                        <li key={i} className='flex items-start gap-3 text-slate-300'>
                                                            <ChevronRight className='w-4 h-4 text-emerald-400 mt-1 flex-shrink-0' />
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Areas for Improvement */}
                                        {feedback[`question_${index+1}`]?.areas_for_improvement?.length > 0 && (
                                            <div className='bg-amber-500/10 rounded-xl p-5 border border-amber-500/20'>
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <TrendingUp className='w-5 h-5 text-amber-400' />
                                                    <h3 className='text-lg font-semibold text-amber-400'>Areas for Improvement</h3>
                                                </div>
                                                <ul className='space-y-2'>
                                                    {feedback[`question_${index+1}`]?.areas_for_improvement?.map((area: string, i: number) => (
                                                        <li key={i} className='flex items-start gap-3 text-slate-300'>
                                                            <ChevronRight className='w-4 h-4 text-amber-400 mt-1 flex-shrink-0' />
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overall Feedback Section */}
                {feedback && (
                    <div className='bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl'>
                        <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-slate-700/50'>
                            <h2 className='text-3xl font-bold text-white flex items-center gap-3'>
                                <Award className='w-8 h-8 text-purple-400' />
                                Overall Performance
                            </h2>
                        </div>

                        <div className='p-6 md:p-8 space-y-8'>
                            {/* Score Card */}
                            <div className='bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30 text-center'>
                                <p className='text-slate-400 text-sm uppercase tracking-wider mb-2'>Your Score</p>
                                <div className='text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2'>
                                    {feedback.overall.score}
                                </div>
                                <p className='text-slate-500 text-xl'>/ 100</p>
                            </div>

                            <div className='grid md:grid-cols-2 gap-6'>
                                {/* Overall Strengths */}
                                <div className='bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20'>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <Award className='w-6 h-6 text-emerald-400' />
                                        <h3 className='text-xl font-semibold text-emerald-400'>Key Strengths</h3>
                                    </div>
                                    <p className='text-slate-300 leading-relaxed'>
                                        {feedback.overall.strengths}
                                    </p>
                                </div>

                                {/* Overall Areas for Improvement */}
                                <div className='bg-amber-500/10 rounded-xl p-6 border border-amber-500/20'>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <AlertCircle className='w-6 h-6 text-amber-400' />
                                        <h3 className='text-xl font-semibold text-amber-400'>Growth Opportunities</h3>
                                    </div>
                                    <p className='text-slate-300 leading-relaxed'>
                                        {feedback.overall.areas_for_improvement}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShowFeedbackPage