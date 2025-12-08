import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import axios from "axios";

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [err, setErr] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get("http://localhost:8800/api/posts", {
                    withCredentials: true
                });
                setPosts(res.data);
            } catch (err) {
                setErr(err);
            }
            setIsLoading(false);
        };
        fetchPosts();
    }, []);

    return <div className="posts flex flex-col gap-10">
        {err ? "Something went wrong!" : isLoading ? "Loading..." : posts.map(post => (
            <Post post={post} key={post.id} />
        ))}
    </div>;
};

export default Posts;
