'use client';

import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export default function Page() {
  const [interviews, setInterviews] = React.useState<any[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [givenInterviewsID, setGivenInterviewsID] = React.useState<string[]>([]);
  const [givenInterviews, setGivenInterviews] = React.useState<any[]>([]);


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
    if (!userId || isLoading) return;
    
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
          setInterviews(data.data);
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    }

    fetchInterviews();
  }, [userId, isLoading]);


    React.useEffect(() => {
    
    async function fetchFeedbacks() {
      try {
        const response = await fetch('/api/vapi/get-given-interviews', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (data.success) {
          console.log("Fetched interview IDs:", data.data);
          setGivenInterviewsID(data.data);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    }

    fetchFeedbacks();
    //from interviews fetch all interviews which have id in givenInterviewsID and set it to givenInterviews
    const filteredInterviews = interviews.filter(interview => givenInterviewsID.includes(interview.id));
    setGivenInterviews(filteredInterviews);
    console.log("Filtered interviews with feedback:", filteredInterviews);


  },[interviews]);


  console.log('Fetched interviews:', interviews);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  interviews.map((interview) => console.log("Interview item:", interview));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero CTA Section */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 gap-8">
            <div className="flex flex-col gap-6 max-w-lg">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Get Interview Ready with AI & Feedback
                </h1>
                <p className="text-lg text-slate-300">
                  Practice on real interview questions and get instant feedback.
                </p>
              </div>

              <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-6 rounded-lg shadow-lg transition-all duration-200 max-sm:w-full">
                <Link href="/interview">Start an Interview</Link>
              </Button>
            </div>

            <div className="flex-shrink-0">
              <Image 
                className="max-sm:hidden drop-shadow-2xl" 
                src="/robot.png" 
                alt="robot bhaiya" 
                width={400} 
                height={400} 
              />
            </div>
          </div>
        </section>

        {/* Your Interviews Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white">See Feedbacks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {givenInterviews.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-lg">No interviews yet. Start your first interview!</p>
              </div>
            ) : (
              givenInterviews.map((interview) => (
                <InterviewCard {...interview} key={interview.id} givenInterviewsID={givenInterviewsID} toAttempt={false} />
              ))
            )}
          </div>
        </section>

        {/* Take Interviews Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white">Take Interviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-lg">No available interviews at the moment.</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <InterviewCard {...interview} key={interview.id} feedback={interview.feedback} givenInterviewsID={givenInterviewsID} toAttempt={true} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

