import dayjs from 'dayjs';
import React from 'react'
import {getRandomInterviewCover} from "@/lib/utils"
import Image from 'next/image';
import { Calendar, Star } from 'lucide-react';
import DisplayTechIcons from './DisplayTechIcons';
import { Button } from './ui/button';
import Link from 'next/link';
import { InterviewCardProps } from '@/types';
import { is } from 'zod/v4/locales';




export type QuestionFeedback = {
  areas_for_improvement: string[];
  score: number;
  strengths: string[];
}

export type feedback = {
  overall: {
    areas_for_improvement: string[];
    score: number;
    strengths: string[];
  };
  interviewId: string;
  timestamp: any; // or Timestamp if using Firebase
} & {
  [key: `question_${number}`]: QuestionFeedback;
}


const InterviewCard = ({id, role, type, techStack, createdAt, givenInterviewsID, toAttempt, company} : InterviewCardProps) => {

  const isAlreadyGiven = givenInterviewsID.includes(id || '');

  const [feedback, setFeedback] = React.useState<feedback | null>(null);
  React.useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await fetch(`/api/vapi/get-feedback`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId: id }),
        });
        const data = await response.json();

        if (data.success) {
          setFeedback(data.data);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    }

    fetchFeedback();
  }, [id]);

  const normalizedType = type.toLowerCase().includes("mix") ? "Mixed" : type;
  const formattedDate = dayjs(createdAt || Date.now()).format('MMM D, YYYY');
  console.log("Techstack in card: ", techStack);

  return (
    <div className='relative group'>
      <div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-xl border border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-600/50 hover:-translate-y-1'>
        {/* Type Badge */}
        <div className='absolute top-0 right-0 z-10'>
          <div className={`px-5 py-2 rounded-bl-2xl rounded-tr-xl text-xs font-semibold shadow-lg ${
            normalizedType === 'Technical' 
              ? 'bg-blue-500 text-white' 
              : normalizedType === 'Mixed'
              ? 'bg-purple-500 text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
          }`}>
            {normalizedType}
          </div>
        </div>

        <div className='p-6 flex flex-col gap-6'>
          {/* Header Section */}
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Image
                  src={getRandomInterviewCover(company)} 
                  alt="cover-photo" 
                  width={80} 
                  height={80} 
                  className="rounded-full object-cover size-[80px] border-4 border-slate-700 shadow-lg" 
                />
                <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full border-2 border-slate-900'></div>
              </div>
              
              <div className='flex-1'>
                <h3 className='text-xl font-bold text-white capitalize leading-tight'>
                  {role} Interview
                </h3>
              </div>
            </div>

            {/* Metadata */}
            <div className='flex flex-wrap gap-4'>
              <div className='flex items-center gap-2 text-slate-300'>
                <Calendar className='w-4 h-4 text-purple-400' />
                <p className='text-sm'>{formattedDate}</p>
              </div>

              <div className='flex items-center gap-2 text-slate-300'>
                <Star className='w-4 h-4 text-yellow-400' />
                <p className='text-sm font-semibold'>{feedback?.overall?.score || '---'}/100</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='min-h-[80px]'>
            <p className='text-sm text-slate-400 leading-relaxed line-clamp-3'>
              {feedback?.overall?.strengths || feedback?.overall?.strengths || "You haven't taken the interview yet. Take it now to improve your skills."}
            </p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between pt-4 border-t border-slate-700/50'>
            <DisplayTechIcons techStack={techStack} />

            <Button className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-all duration-200'>
              <Link href={feedback && !toAttempt ? `/interview/${id}/show-feedback` : `/interview/take-interview/${id}`}>
                {isAlreadyGiven && !toAttempt ? "Check Feedback" : "Take Interview"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard