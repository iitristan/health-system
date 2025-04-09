// src/app/page.tsx (or wherever your main entry page is)

'use client'; // This ensures that the code runs on the client-side

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useRouter hook for routing

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to '/home' when the component mounts
    router.push('/home');
  }, [router]); // Empty dependency array ensures this runs only once, on component mount

  return <div>Redirecting...</div>; // You can display a loading message while redirecting
}
