'use client'
import { cn, getTechLogos } from '@/lib/utils'
import { TechIconProps } from '@/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<Array<{ tech: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     // Early return if techStack is empty or undefined
    if (!techStack || !Array.isArray(techStack) || techStack.length === 0) {
      setTechIcons([]);
      console.log('No tech stack provided');
      setIsLoading(false);
      return;
    }

    async function fetchTechLogos() {
      try {
        setIsLoading(true);
        const icons = await getTechLogos(techStack);
        setTechIcons(icons);
      } catch (error) {
        console.error('Error fetching tech logos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTechLogos();
  }, [techStack]);

  if (isLoading) {
    return (
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-slate-700/50 animate-pulse'></div>
        <div className='w-8 h-8 rounded-full bg-slate-700/50 animate-pulse -ml-2'></div>
        <div className='w-8 h-8 rounded-full bg-slate-700/50 animate-pulse -ml-2'></div>
      </div>
    );
  }

  if (!techIcons || techIcons.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center'>
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div 
          key={tech} 
          className={cn(
            "relative group transition-transform duration-200 hover:scale-110 hover:z-10",
            index >= 1 && '-ml-2'
          )}
        >
          {/* Tooltip */}
          <span className='absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-slate-700'>
            {tech}
            <span className='absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900'></span>
          </span>
          
          {/* Icon Container */}
          <div className='w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-md group-hover:border-purple-500 group-hover:shadow-lg transition-all duration-200'>
            <Image 
              src={url} 
              alt={tech} 
              width={20} 
              height={20} 
              className="w-5 h-5 object-contain" 
            />
          </div>
        </div>
      ))}
      
      {/* Show count if more than 3 */}
      {techIcons.length > 3 && (
        <div className='w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-slate-600 flex items-center justify-center shadow-md -ml-2 text-white text-xs font-bold'>
          +{techIcons.length - 3}
        </div>
      )}
    </div>
  )
}

export default DisplayTechIcons