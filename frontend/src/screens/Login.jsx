import React, { useState } from "react";
import axiosInstance from "../config/axios";
import { Link, useNavigate } from "react-router-dom";
import { userTheme } from "../context/User.Context.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = userTheme();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/users/login", { email, password });
      console.log("Data: ", res.data.user);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      console.log()
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data);
      } else if (error.request) {
        console.error("No response recieved:", error.response.request);
      } else {
        console.error("Error setting up request", error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form className="space-y-4" onSubmit={submitHandler}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-gray-100 font-semibold transition"
          >
            Login
          </button>
        </form>
        {/* Already Have an Account */}
        <p className="text-center mt-4 text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
