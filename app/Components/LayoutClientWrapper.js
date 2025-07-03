// components/LayoutClientWrapper.jsx
'use client'; // This directive makes it a client component

import { usePathname } from 'next/navigation';
import Navbar from './Navbar'; // Assuming Navbar is in the same components directory
import React from 'react';

const LayoutClientWrapper = ({ children }) => {
    const pathname = usePathname(); // Get the current path

    // Determine if the Navbar should be shown
    const showNavbar = pathname !== '/admin';

    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    );
};

export default LayoutClientWrapper;