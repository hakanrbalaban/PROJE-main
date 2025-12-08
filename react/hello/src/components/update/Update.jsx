import { useState } from "react";
import axios from "axios";
import { IoCloudUploadOutline } from "react-icons/io5";

const Update = ({ setOpenUpdate, user }) => {
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null);
    const [texts, setTexts] = useState({
        name: user.name || "",
        city: user.city || "",
        website: user.website || "",
    });

    const upload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post("http://localhost:8800/api/upload", formData);
            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let coverUrl;
        let profileUrl;

        coverUrl = cover ? await upload(cover) : user.coverPic;
        profileUrl = profile ? await upload(profile) : user.profilePic;

        try {
            await axios.put("http://localhost:8800/api/users", { ...texts, coverPic: coverUrl, profilePic: profileUrl }, { withCredentials: true });
            setOpenUpdate(false);
            window.location.reload();
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.sqlMessage || err.response?.data || "Error updating profile");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#222] p-12 rounded-md shadow-lg flex flex-col gap-5 relative h-[80%] w-[40%] text-gray-700 dark:text-gray-200 overflow-y-auto">
                <button onClick={() => setOpenUpdate(false)} className="absolute top-2 right-2 border-none bg-red-500 text-white p-1 cursor-pointer rounded">X</button>
                <h1 className="text-xl font-bold">Update Your Profile</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-wrap gap-5">
                        <div className="flex flex-col gap-2">
                            <span>Cover Picture</span>
                            <label htmlFor="cover" className="cursor-pointer underline text-gray-500 text-sm">
                                <IoCloudUploadOutline className="text-2xl" />
                            </label>
                            <input type="file" id="cover" className="hidden" onChange={e => setCover(e.target.files[0])} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span>Profile Picture</span>
                            <label htmlFor="profile" className="cursor-pointer underline text-gray-500 text-sm">
                                <IoCloudUploadOutline className="text-2xl" />
                            </label>
                            <input type="file" id="profile" className="hidden" onChange={e => setProfile(e.target.files[0])} />
                        </div>
                    </div>

                    <label>Name</label>
                    <input type="text" value={texts.name} name="name" onChange={handleChange} className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />

                    <label>City</label>
                    <input type="text" value={texts.city} name="city" onChange={handleChange} className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />

                    <label>Website</label>
                    <input type="text" value={texts.website} name="website" onChange={handleChange} className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />

                    <button type="submit" className="border-none p-2 cursor-pointer bg-blue-500 text-white rounded">Update</button>
                </form>
            </div>
        </div>
    );
};

export default Update;
