import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { IoEllipsisHorizontal, IoHeartOutline, IoHeart, IoChatbubbleOutline, IoShareSocialOutline } from "react-icons/io5";
import Comments from "../comments/Comments";
import moment from "moment";
import axios from "axios";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);
    const [likes, setLikes] = useState([]);
    const { currentUser } = useContext(AuthContext);

    const fetchLikes = async () => {
        try {
            const res = await axios.get("http://localhost:8800/api/likes?postId=" + post.id);
            setLikes(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchLikes();
    }, [post.id]);

    const handleLike = async () => {
        try {
            if (likes.includes(currentUser.id)) {
                await axios.delete("http://localhost:8800/api/likes?postId=" + post.id, { withCredentials: true });
                setLikes(likes.filter(id => id !== currentUser.id));
            } else {
                await axios.post("http://localhost:8800/api/likes", { postId: post.id }, { withCredentials: true });
                setLikes([...likes, currentUser.id]);
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="shadow-md rounded-[20px] bg-white dark:bg-[#222] text-gray-700 dark:text-gray-200 mb-8 p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <img src={post.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                        <Link to={`/profile/${post.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <span className="font-semibold">{post.name}</span>
                        </Link>
                        <span className="text-xs text-gray-500">{moment(post.createdAt).fromNow()}</span>
                    </div>
                </div>
                <IoEllipsisHorizontal className="cursor-pointer" />
            </div>
            <div className="my-5">
                <p>{post.desc}</p>
                {post.img && <img src={"http://localhost:8800/upload/" + post.img} alt="" className="w-full max-h-[500px] object-cover mt-5 rounded-md" />}
            </div>
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 cursor-pointer text-sm" onClick={handleLike}>
                    {likes.includes(currentUser.id) ? <IoHeart className="text-red-500 text-xl" /> : <IoHeartOutline className="text-xl" />}
                    {likes.length} Likes
                </div>
                <div className="flex items-center gap-2 cursor-pointer text-sm" onClick={() => setCommentOpen(!commentOpen)}>
                    <IoChatbubbleOutline className="text-xl" />
                    Comments
                </div>
                <div className="flex items-center gap-2 cursor-pointer text-sm">
                    <IoShareSocialOutline className="text-xl" />
                    Share
                </div>
            </div>
            {commentOpen && <Comments postId={post.id} />}
        </div>
    );
};

export default Post;
