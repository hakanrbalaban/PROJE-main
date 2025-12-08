import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import moment from "moment";

const Comments = ({ postId }) => {
    const [desc, setDesc] = useState("");
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("http://localhost:8800/api/comments?postId=" + postId);
            setComments(res.data);
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8800/api/comments", {
                desc,
                postId
            }, {
                withCredentials: true
            });
            setDesc("");
            fetchComments();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="comments">
            <div className="write flex items-center justify-between gap-5 my-5">
                <img src={currentUser.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
                <input
                    type="text"
                    placeholder="write a comment"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent dark:text-gray-200"
                />
                <button onClick={handleClick} className="border-none bg-blue-500 text-white p-2.5 cursor-pointer rounded text-sm">Send</button>
            </div>
            {isLoading ? "Loading" : comments.map((comment) => (
                <div className="comment my-7 flex gap-5 justify-between" key={comment.id}>
                    <div className="flex gap-5 flex-1 items-start">
                        <img src={comment.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div className="info flex flex-col gap-1 items-start flex-1">
                            <span className="font-bold text-gray-700 dark:text-gray-200">{comment.name}</span>
                            <p className="text-gray-600 dark:text-gray-300 m-0">{comment.desc}</p>
                        </div>
                        <span className="date flex self-center text-xs text-gray-400">{moment(comment.createdAt).fromNow()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Comments;
