import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import {
    IoImageOutline,
    IoMapOutline,
    IoHappyOutline,
    IoVideocamOutline
} from "react-icons/io5";
import axios from "axios";

const Share = () => {

    const [file, setFile] = useState(null);
    const [desc, setDesc] = useState("");

    const { currentUser } = useContext(AuthContext);

    const upload = async () => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post("http://localhost:8800/api/upload", formData);
            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    const handleClick = async (e) => {
        e.preventDefault();
        let imgUrl = "";
        if (file) imgUrl = await upload();

        try {
            await axios.post("http://localhost:8800/api/posts", {
                desc,
                img: imgUrl
            }, {
                withCredentials: true
            });
            setDesc("")
            setFile(null)
            window.location.reload();
        } catch (err) {
            console.log(err)
            const errorMsg = err.response?.data?.sqlMessage || err.response?.data?.message || err.response?.data || "Error creating post";
            alert(errorMsg);
        }
    };

    return (
        <div className="shadow-md rounded-[20px] bg-white dark:bg-[#222] text-gray-700 dark:text-gray-200 mb-5">
            <div className="p-5">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2.5 flex-[3]">
                        <img
                            src={currentUser.profilePic}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <input
                            type="text"
                            placeholder={`What's on your mind ${currentUser.name}?`}
                            onChange={(e) => setDesc(e.target.value)}
                            value={desc}
                            className="border-none outline-none p-2.5 w-full bg-transparent text-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div className="flex items-center gap-5 flex-[1] justify-end">
                        <input type="file" id="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
                        <label htmlFor="file">
                            <div className="flex items-center gap-2.5 cursor-pointer">
                                <IoImageOutline className="text-2xl text-gray-500" />
                                <span className="text-xs text-gray-500 hidden sm:block">Add Image</span>
                            </div>
                        </label>
                        <div className="flex items-center gap-2.5 cursor-pointer">
                            <IoMapOutline className="text-2xl text-gray-500" />
                            <span className="text-xs text-gray-500 hidden sm:block">Add Place</span>
                        </div>
                        <label htmlFor="file">
                            <div className="flex items-center gap-2.5 cursor-pointer">
                                <IoVideocamOutline className="text-2xl text-gray-500" />
                                <span className="text-xs text-gray-500 hidden sm:block">Add Video</span>
                            </div>
                        </label>
                        <div className="flex items-center gap-2.5 cursor-pointer">
                            <IoHappyOutline className="text-2xl text-gray-500" />
                            <span className="text-xs text-gray-500 hidden sm:block">Tag Friends</span>
                        </div>
                    </div>
                </div>
                {file && <div className="text-sm text-green-500 mt-2">File selected: {file.name}</div>}
                <div className="flex justify-end mt-2">
                    <button onClick={handleClick} className="border-none p-1.5 text-white bg-blue-500 rounded cursor-pointer text-sm">Share</button>
                </div>
            </div>
        </div>
    );
};

export default Share;
