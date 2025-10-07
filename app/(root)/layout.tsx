'use client';
import { isAuthenticated } from '@/lib/actions/auth.action';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

const RootLayout = ({children} : { children: React.ReactNode }) => {
  const router = useRouter();
  const [isUserAuthenticated, setIsUserAuthenticated] = React.useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    async function checkAuth(){
      const authenticated = await isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      // Only redirect if not authenticated
      if (!authenticated) {
        router.push('/sign-in');
      }
    }
    checkAuth();
  }, [router]);

  async function handleLogout(){
    if (isLoggingOut) return; // Prevent double clicks
    
    setIsLoggingOut(true);
    try {
      await fetch('/api/user/signout', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      localStorage.clear();
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }

  // Show loading state while checking authentication
  if (isUserAuthenticated === null) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isUserAuthenticated) {
    return null;
  }
    
  return (
    <div className='root-layout'>
      <div className='flex items-center justify-between'>
        <nav>
          <Link href="/" className='flex items-center gap-2'>
            <Image src="/logo.svg" alt="logo" height={32} width={38} />
            <h2 className='text-primary-100'>PrepWise</h2>
          </Link>
        </nav>
        <div>
          <button 
            className='relative group px-6 py-2.5 font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:bg-gray-50 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {/* Subtle hover effect */}
            <span className='absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></span>
            
            {/* Button content */}
            <span className='relative flex items-center gap-2'>
              {isLoggingOut ? (
                <>
                  <svg className='animate-spin h-4 w-4' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </>
              )}
            </span>
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

export default RootLayout;