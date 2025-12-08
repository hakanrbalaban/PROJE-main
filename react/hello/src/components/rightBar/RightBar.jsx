import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/authContext';
import { Link } from 'react-router';

const RightBar = () => {
    const [suggestions, setSuggestions] = useState([]);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axios.get("http://localhost:8800/api/users/suggestions");
                // Filter out current user from suggestions just in case db query included it
                setSuggestions(res.data.filter(u => u.id !== currentUser.id));
            } catch (err) {
                console.log(err);
            }
        };
        fetchSuggestions();
    }, [currentUser.id]);

    return (
        <div className="flex-[3.5] bg-[#f6f3f3] dark:bg-[#333] hidden lg:block overflow-scroll h-[calc(100vh-50px)] sticky top-[50px] scrollbar-hide">
            <div className="p-5">
                <div className="shadow-md bg-white dark:bg-[#222] p-5 mb-5 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300">Suggestions For You</span>
                    {suggestions.map((user) => (
                        <div className="flex items-center justify-between my-5" key={user.id}>
                            <div className="flex items-center gap-2.5">
                                <img src={user.profilePic || "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <Link to={`/profile/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                                </Link>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Link to={`/profile/${user.id}`}>
                                    <button className="border-none p-1.5 text-white bg-[#0057ae] rounded cursor-pointer text-sm">View Profile</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shadow-md bg-white dark:bg-[#222] p-5 mb-5 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300">Latest Activities</span>
                    <div className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2.5">
                            <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-10 h-10 rounded-full object-cover" />
                            <p className="text-gray-500 dark:text-gray-300 text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-200 mr-1">Jane Doe</span>
                                changed their cover picture
                            </p>
                        </div>
                        <span className="text-gray-500 text-xs">1 min ago</span>
                    </div>
                    <div className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2.5">
                            <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-10 h-10 rounded-full object-cover" />
                            <p className="text-gray-500 dark:text-gray-300 text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-200 mr-1">Jane Doe</span>
                                liked a post
                            </p>
                        </div>
                        <span className="text-gray-500 text-xs">1 min ago</span>
                    </div>
                </div>

                <div className="shadow-md bg-white dark:bg-[#222] p-5 mb-5 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300">Online Friends</span>
                    <div className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2.5 relative">
                            <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Jane Doe</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2.5 relative">
                            <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Jane Doe</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2.5 relative">
                            <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Jane Doe</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightBar;
