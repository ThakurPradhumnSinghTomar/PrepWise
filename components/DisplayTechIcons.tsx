
import { cn, getTechLogos } from '@/lib/utils'
import Image from 'next/image';
import React, { useEffect } from 'react'

const DisplayTechIcons =  ({techStack} : TechIconProps) => {
  const [icons,setIcons] = React.useState<any[]>([]);

    useEffect(()=> {
      async function fetchIcons(){
        const res = await fetch("/api/icons?stack="+techStack.join(","));
        const data = await res.json();
        setIcons(data);
      }
      fetchIcons();
    }, [techStack]);
  return (
    <div className='flex flex-row'>{icons.slice(0,3).map(({tech,url}, index ) => (
        <div key={tech} className={cn("relative group bg-dark-300 rounded-full p-2 flex-center", index>=1 && '-ml-3')}>
            <span className='tech-tooltip'>{tech}</span>
            <Image src={url} alt={tech} width={100} height={100} className="size-5" />
         </div>
    ))}</div>
  )
}

export default DisplayTechIcons