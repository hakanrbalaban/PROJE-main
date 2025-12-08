import React from 'react';
import Navbar from '../navbar/Navbar';
import LeftBar from '../leftBar/LeftBar';
import RightBar from '../rightBar/RightBar';
import { Outlet } from 'react-router';

const Layout = () => {
    return (
        <div className="bg-[#f6f3f3] dark:bg-[#111] min-h-screen">
            <Navbar />
            <div className="flex">
                <LeftBar />
                <div style={{ flex: 6 }}>
                    <Outlet />
                </div>
                <RightBar />
            </div>
        </div>
    );
};

export default Layout;
