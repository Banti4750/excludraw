"use client"
import { useState, useRef, useEffect } from 'react';
import { Circle, Pencil, RectangleHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation'
import React from 'react'
import { RoomCanvas } from '@/app/component/RoomCanvas';

const Page = () => {
    const pathname = usePathname();
    const roomId = pathname.split('/')[2];

    return (

        <div className='bg-black h-screen'>
            <RoomCanvas roomId={roomId} />
        </div>
    )
};

export default Page;