import axiosInstance from "../config/axios"; // Correct import of axios instance
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userTheme } from "../context/user.context.jsx";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setUser } = userTheme();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Use relative path, since baseURL is already set in the axiosInstance
      const res = await axiosInstance.post("/users/register", {
        email,
        password,
      });
      setUser(res.data.user);
      console.log(res.data.token);
      localStorage.setItem("token", res.data.token);
      navigate("/"); // Redirect after successful registration
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
        <form onSubmit={submitHandler} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              value={email}
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
              value={password}
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
            Signup
          </button>
        </form>
        {/* Already Have an Account */}
        <p className="text-center mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
