import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from "axios";

const Register = () => {
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        name: "",
    });
    const [err, setErr] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8800/api/auth/register", inputs);
            navigate("/login");
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
                <h1 className="text-3xl font-bold text-gray-700">Register</h1>
                <form className="flex flex-col gap-4">
                    <input type="text" placeholder="Username" name="username" onChange={handleChange} className="border p-2 rounded" />
                    <input type="email" placeholder="Email" name="email" onChange={handleChange} className="border p-2 rounded" />
                    <input type="password" placeholder="Password" name="password" onChange={handleChange} className="border p-2 rounded" />
                    <input type="text" placeholder="Name" name="name" onChange={handleChange} className="border p-2 rounded" />
                    {err && <span className="text-red-500 text-sm">{err}</span>}
                    <button onClick={handleClick} className="bg-purple-600 text-white p-2 rounded cursor-pointer">Register</button>
                </form>
                <Link to="/login" className="text-sm text-center text-gray-500">Already have an account? Login</Link>
            </div>
        </div>
    );
};

export default Register;
