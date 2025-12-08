import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthContext } from "../../context/authContext";

const Login = () => {
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });
    const [err, setErr] = useState(null);

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(inputs);
            navigate("/");
        } catch (err) {
            const errorData = err.response?.data;
            if (typeof errorData === 'string') {
                setErr(errorData);
            } else {
                setErr(errorData?.message || errorData?.sqlMessage || errorData?.code || "An unknown error occurred");
            }
        }
    };

    return (
        <div className="h-screen bg-purple-200 flex items-center justify-center">
            <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col gap-5 w-[350px]">
                <h1 className="text-3xl font-bold text-gray-700">Login</h1>
                <form className="flex flex-col gap-4">
                    <input type="text" placeholder="Username" name="username" onChange={handleChange} className="border p-2 rounded" />
                    <input type="password" placeholder="Password" name="password" onChange={handleChange} className="border p-2 rounded" />
                    {err && <span className="text-red-500 text-sm">{err}</span>}
                    <button onClick={handleLogin} className="bg-purple-600 text-white p-2 rounded cursor-pointer">Login</button>
                </form>
                <Link to="/register" className="text-sm text-center text-gray-500">Don't have an account? Register</Link>
            </div>
        </div>
    );
};

export default Login;
