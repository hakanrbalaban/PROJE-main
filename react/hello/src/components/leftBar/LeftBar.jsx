import React from 'react';

import { Link } from 'react-router';

// Since I don't have the assets actually, I will use placeholders or try to use Icons to replace them if they are missing.
// For now I will assume the user has issues if I just import images that don't exist.
// BETTER APPROACH: Use Icons instead of Images for now to avoid broken images.
import {
    IoPeopleOutline,
    IoPeopleCircleOutline,
    IoStorefrontOutline,
    IoVideocamOutline,
    IoTimeOutline,
    IoCalendarOutline,
    IoGameControllerOutline,
    IoImagesOutline,
    IoPlayCircleOutline,
    IoChatbubbleEllipsesOutline,
    IoBookOutline,
    IoSchoolOutline,
    IoCashOutline
} from "react-icons/io5";

const LeftBar = () => {

    const menuItems = [
        { id: 1, name: "Friends", icon: <IoPeopleOutline size={25} className="text-blue-500" />, path: "/friends" },
        { id: 2, name: "Groups", icon: <IoPeopleCircleOutline size={25} className="text-blue-500" />, path: "/groups" },
        { id: 3, name: "Marketplace", icon: <IoStorefrontOutline size={25} className="text-blue-500" />, path: "/marketplace" },
        { id: 4, name: "Watch", icon: <IoVideocamOutline size={25} className="text-blue-500" />, path: "/watch" },
        { id: 5, name: "Memories", icon: <IoTimeOutline size={25} className="text-blue-500" />, path: "/memories" },
    ];

    const shortcuts = [
        { id: 6, name: "Events", icon: <IoCalendarOutline size={25} className="text-blue-500" />, path: "/events" },
        { id: 7, name: "Gaming", icon: <IoGameControllerOutline size={25} className="text-blue-500" />, path: "/gaming" },
        { id: 8, name: "Gallery", icon: <IoImagesOutline size={25} className="text-blue-500" />, path: "/gallery" },
        { id: 9, name: "Videos", icon: <IoPlayCircleOutline size={25} className="text-blue-500" />, path: "/videos" },
        { id: 10, name: "Messages", icon: <IoChatbubbleEllipsesOutline size={25} className="text-blue-500" />, path: "/messages" },
    ];

    const others = [
        { id: 11, name: "Tutorials", icon: <IoBookOutline size={25} className="text-blue-500" />, path: "/tutorials" },
        { id: 12, name: "Courses", icon: <IoSchoolOutline size={25} className="text-blue-500" />, path: "/courses" },
        { id: 13, name: "Fund", icon: <IoCashOutline size={25} className="text-blue-500" />, path: "/fund" },
    ];

    return (
        <div className="flex-[2] sticky top-[50px] h-[calc(100vh-50px)] overflow-scroll scrollbar-hide bg-white dark:bg-[#222] dark:text-gray-200 hidden md:block">
            <div className="p-5">
                <div className="flex flex-col gap-5">
                    {menuItems.map(item => (
                        <div className="flex items-center gap-3" key={item.id}>
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
                <hr className="my-5 border-gray-200 dark:border-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-3 block">Your shortcuts</span>
                <div className="flex flex-col gap-5">
                    {shortcuts.map(item => (
                        <div className="flex items-center gap-3" key={item.id}>
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
                <hr className="my-5 border-gray-200 dark:border-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-3 block">Others</span>
                <div className="flex flex-col gap-5">
                    {others.map(item => (
                        <div className="flex items-center gap-3" key={item.id}>
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeftBar;
