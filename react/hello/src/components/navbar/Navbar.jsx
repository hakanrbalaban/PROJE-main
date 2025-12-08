import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import {
    IoHomeOutline,
    IoMoonOutline,
    IoGridOutline,
    IoNotificationsOutline,
    IoMailOutline,
    IoSearchOutline,
    IoPersonOutline
} from "react-icons/io5";

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="flex items-center justify-between px-5 py-2.5 h-[50px] border-b border-gray-200 dark:border-[#444] sticky top-0 bg-white dark:bg-[#222] z-50">
            <div className="flex items-center gap-7">
                <Link to="/" className="text-xl font-bold text-blue-700 decoration-0">
                    lamasocial
                </Link>
                <div className="flex items-center gap-2">
                    <IoHomeOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                    <IoMoonOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                    <IoGridOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                </div>
                <div className="flex items-center dark:bg-gray-800 bg-white dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md p-1 gap-2 w-[400px]">
                    <IoSearchOutline />
                    <input type="text" placeholder="Search..." className="border-none w-full outline-none bg-transparent text-gray-800 dark:text-gray-200" />
                </div>
            </div>
            <div className="flex items-center gap-5">
                <IoPersonOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                <IoMailOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                <IoNotificationsOutline className='w-5 h-5 cursor-pointer dark:text-gray-200' />
                <div className="flex items-center gap-2.5 font-bold relative cursor-pointer" onClick={() => setOpen(!open)}>
                    <img src={currentUser.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="hidden sm:block dark:text-gray-200">{currentUser.name}</span>
                    {open && (
                        <div className="absolute top-[50px] right-0 bg-white dark:bg-[#333] p-5 shadow-md rounded-md flex flex-col gap-2.5 z-50 w-[200px]">
                            <Link to={`/profile/${currentUser.id}`} className="flex items-center gap-2 text-gray-500 dark:text-gray-200 hover:text-blue-500">
                                <IoPersonOutline />
                                <span>Profile</span>
                            </Link>
                            <span onClick={handleLogout} className="flex items-center gap-2 text-red-500 cursor-pointer hover:text-red-700">
                                <span>Logout</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
