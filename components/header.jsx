'use client';

import useStoreUser from '@/hooks/use-store-user';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { BarLoader } from "react-spinners";

const Header = () => {
  const { isLoading } = useStoreUser();

  
  return (
    <header className='fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60'>
      <nav className='container mx-auto px-4 h-13 flex items-center justify-between'>
        <Link href='/' className="flex items-center gap-2" >
          <Image src={'/logos/logo.png'} alt={"splitly logo"} width={200} height={60} className="h-11 w-auto object-contain" />
        </Link>
      </nav>

      {isLoading && <BarLoader width={"100%"} color='#ff7700' />}
    </header>
  )
}

export default Header
