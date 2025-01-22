import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";

const CreateProjectModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const openModal = () => {
    setErrorMessage(null);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated. Please log in.");
        }

        const res = await axiosInstance.get("/project/all-project");

        if (res.status !== 200 || !res.data) {
          throw new Error("Unexpected response from the server.");
        }

        if (res.data.allProject.length > 0) {
          setProjects(res.data.allProject);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch all the projects:", error);
        setErrorMessage(
          error.response?.data?.message || error.message || "Failed to load projects."
        );
      }
    };

    fetchProjects();
  }, []); // Empty dependency array to ensure it runs once

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMessage(null); // Reset error message

    if (!name.trim()) {
      setErrorMessage("Project name cannot be empty.");
      return;
    }

    try {
      const res = await axiosInstance.post("/project/create", { name });

      if (!res || res.status !== 201) {
        throw new Error("Failed to create the project. Please try again later.");
      }

      console.log("Project Created:", res.data);
      setProjects((prev) => [...prev, res.data.project]);
    } catch (error) {
      console.error("Error during project creation:", error);
      setErrorMessage(
        error.response?.data?.message || error.message || "Failed to create project."
      );
    } finally {
      closeModal();
    }
  };

  return (
    <main className="p-4">
      <div className="projects">
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <div className="project flex flex-wrap gap-2">
          <button
            onClick={openModal}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            New Project
            <i className="ri-link ml-2"></i>
          </button>

          {projects.map((project) => (
            <div
              onClick={() => navigate("/project", { state: project })}
              key={project._id}
              className="project cursor-pointer p-4 border border-slate-100 hover:bg-slate-200 rounded-md w-52"
            >
              <h2 className="font-semibold">{project.name}</h2>
              <div className="flex gap-2">
                <p>
                  <small>
                    <i className="ri-user-line"></i>
                  </small>
                  <small>Collaborator : </small>
                </p>
                {project.users.length}
              </div>
            </div>
          ))}
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h1 className="text-2xl font-bold mb-4">Create Project</h1>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {errorMessage && (
                  <p className="text-red-600 mb-2">{errorMessage}</p>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CreateProjectModal;