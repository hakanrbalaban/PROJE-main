import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import { IoLogoFacebook, IoLogoLinkedin, IoLogoInstagram, IoLogoPinterest, IoLogoTwitter, IoLocationSharp, IoLanguage, IoMailOutline, IoEllipsisVertical } from "react-icons/io5";
import Posts from "../../components/posts/Posts";
import Update from "../../components/update/Update";

const Profile = () => {
    const [openUpdate, setOpenUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});
    const userId = parseInt(useLocation().pathname.split("/")[2]);
    const { currentUser } = useContext(AuthContext);

    const [relationshipData, setRelationshipData] = useState([]);
    const [relationshipLoading, setRelationshipLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userRes = await axios.get("http://localhost:8800/api/users/find/" + userId);
                const profileUser = userRes.data;
                setUser(profileUser);
            } catch (err) {
                console.log(err);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [userId]);

    useEffect(() => {
        const fetchRelationship = async () => {
            setRelationshipLoading(true);
            try {
                const res = await axios.get("http://localhost:8800/api/relationships?followedUserId=" + userId);
                setRelationshipData(res.data);
            } catch (err) {
                console.log(err);
            }
            setRelationshipLoading(false);
        }
        fetchRelationship();
    }, [userId]);


    const handleFollow = async () => {
        try {
            if (relationshipData.includes(currentUser.id)) {
                await axios.delete("http://localhost:8800/api/relationships?userId=" + userId, { withCredentials: true });
                setRelationshipData(relationshipData.filter(id => id !== currentUser.id));
            } else {
                await axios.post("http://localhost:8800/api/relationships", { userId }, { withCredentials: true });
                setRelationshipData([...relationshipData, currentUser.id]);
            }
        } catch (err) {
            console.log(err);
        }
    };


    return (
        <div className="profile w-full bg-[#f6f3f3] dark:bg-[#333]">
            {isLoading ? "Loading..." : <>
                <div className="images w-full h-[300px] relative">
                    <img
                        src={user.coverPic ? (user.coverPic.startsWith("http") ? user.coverPic : "http://localhost:8800/upload/" + user.coverPic) : "https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <img
                        src={user.profilePic ? (user.profilePic.startsWith("http") ? user.profilePic : "http://localhost:8800/upload/" + user.profilePic) : "https://images.pexels.com/photos/14028501/pexels-photo-14028501.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"}
                        alt=""
                        className="w-[200px] h-[200px] rounded-full object-cover absolute left-0 right-0 m-auto top-[150px]"
                    />
                </div>
                <div className="profileContainer p-[20px] md:p-[70px] pt-[100px] md:pt-[100px] flex flex-col items-center gap-5 mb-5 md:mb-5">
                    <div className="uInfo h-[180px] shadow-md bg-white dark:bg-[#222] text-gray-700 dark:text-gray-200 rounded-[20px] p-[50px] flex flex-col md:flex-row items-center justify-between w-full">
                        <div className="left flex-1 flex gap-2.5 text-2xl text-gray-500 justify-center md:justify-start">
                            <a href="http://facebook.com">
                                <IoLogoFacebook fontSize="large" />
                            </a>
                            <a href="http://instagram.com">
                                <IoLogoInstagram fontSize="large" />
                            </a>
                            <a href="http://twitter.com">
                                <IoLogoTwitter fontSize="large" />
                            </a>
                            <a href="http://linkedin.com">
                                <IoLogoLinkedin fontSize="large" />
                            </a>
                            <a href="http://pinterest.com">
                                <IoLogoPinterest fontSize="large" />
                            </a>
                        </div>
                        <div className="center flex-1 flex flex-col items-center gap-2.5">
                            <span className="font-medium text-[30px]">{user.name}</span>
                            <div className="info flex items-center justify-around w-full">
                                <div className="item flex items-center gap-[5px] text-gray-500">
                                    <IoLocationSharp />
                                    <span className="text-sm">{user.city || "USA"}</span>
                                </div>
                                <div className="item flex items-center gap-[5px] text-gray-500">
                                    <IoLanguage />
                                    <span className="text-sm">{user.website || "lama.dev"}</span>
                                </div>
                            </div>
                            {userId === currentUser.id ? (
                                <button onClick={() => setOpenUpdate(true)} className="border-none bg-blue-500 text-white p-2.5 rounded cursor-pointer">Update</button>
                            ) : (
                                <button onClick={handleFollow} className="border-none bg-blue-500 text-white p-2.5 rounded cursor-pointer">
                                    {relationshipLoading ? "loading" : relationshipData.includes(currentUser.id) ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>
                        <div className="right flex-1 flex items-center justify-end gap-2.5">
                            <IoMailOutline />
                            <IoEllipsisVertical />
                        </div>
                    </div>
                    <Posts userId={userId} />
                </div>
            </>}
            {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={user} />}
        </div>
    );
};

export default Profile;
