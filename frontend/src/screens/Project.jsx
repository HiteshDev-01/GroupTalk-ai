import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { userTheme } from '../context/User.Context.jsx';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { getWebContainer } from '../config/webContexiner.js';

const Project = () => {
  const location = useLocation();
  const { user } = userTheme();

  const [openSidebar, setOpenSidebar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [project, setProject] = useState(location.state || null);
  const [fileTree, setFileTree] = useState()
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);

  const messageBoxRef = useRef(null);

  const onOpen = () => setIsModalOpen(true);
  const onClose = () => setIsModalOpen(false);

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUserId((prevIds) =>
      prevIds.includes(id) ? prevIds.filter((item) => item !== id) : [...prevIds, id]
    );
  };

  const addCollaborators = async () => {
    try {
      await axiosInstance.put('/project/add-user', {
        projectId: project._id,
        users: selectedUserId,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add collaborators:', error.response?.data || error.message);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/all-user');
      setUsers(res.data.allUser);
    } catch (error) {
      console.error('Failed to fetch users:', error.response?.data || error.message);
    }
  };

  const fetchProject = async () => {
    try {
      if (!location.state) {
        const res = await axiosInstance.get(`/project/${project?._id}`);
        setProject(res.data.project);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error.response?.data || error.message);
    }
  };

  const send = () => {
    const outgoingMessage = {
      message,
      sender: user,
    };
    sendMessage('project-message', outgoingMessage);
    setMessages((prevMessages) => [...prevMessages, { ...outgoingMessage, isOutgoing: true }]);
    setMessage('');
  };

  const handleIncomingMessage = (messageObject) => {
    setMessages((prevMessages) => [...prevMessages, { ...messageObject, isOutgoing: false }]);
  };

  useEffect(() => {
    if (!project) return;

    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        console.log("Container started");
        setWebContainer(container)
      })
    }

    const isJson = (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    };

    receiveMessage('project-message', (data) => {
      const message = data.message;
      console.log("Raw message received:", message);

      // Step 1: Clean the string
      const cleanedString = message
        .replace(/^```json\n/, '') // Remove starting ```json and newline
        .replace(/\n```$/, '')    // Remove ending ``` and newline
        .replace(/`/g, '')        // Remove backticks
        .replace(/[\r\n]+/g, ' ') // Replace newlines with space
        .replace(/\s+/g, ' ')     // Collapse multiple spaces to one
        .trim();

      // Step 2: Check if the string is JSON
      if (isJson(cleanedString)) {
        try {
          const parsedData = JSON.parse(cleanedString);
          console.log("Parsed JSON:", parsedData);

          if (parsedData && parsedData.fileTree) {
            setFileTree(parsedData.fileTree); // Handle JSON fileTree
          } else {
            handleIncomingMessage(data); // Handle as-is
          }
        } catch (parseError) {
          console.error("JSON.parse failed:", parseError);
        }
      } else {
        // Step 3: Handle as plain text if not JSON
        console.warn("Message is not valid JSON. Handling as plain text.");
        handleIncomingMessage(data); // Pass plain text
      }
    });


    const token = localStorage.getItem('token');
    if (token) {
      fetchAllUsers();
      fetchProject();
    }
  }, [project?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessageContent = (msg) => {
    // Regular expression to match text and code blocks
    const parts = msg.message.split(/(```[\s\S]*?```)/);

    return (
      <div>
        {parts.map((part, index) => {
          // Check if this part is a code block
          const isCode = /```[\s\S]*```/.test(part);

          if (isCode) {
            // Extract code block content
            const codeContent = part.match(/```([\s\S]*?)```/)[1];
            // Highlight the extracted code
            const highlightedCode = Prism.highlight(codeContent, Prism.languages.javascript, 'javascript');

            return (
              <pre className="language-javascript" key={index}>
                <code dangerouslySetInnerHTML={{ __html: highlightedCode }}></code>
              </pre>
            );
          }

          return (
            <p className="text-sm text-gray-800" key={index}>
              {part}
            </p>
          );
        })}
      </div>
    );
  };


  if (!project) return <p>Loading project details...</p>;

  return (
    <main className="w-screen h-screen flex">
      <section className="left relative max-w-72 flex flex-col bg-blue-700" style={{ height: '100%' }}>
        <header className="w-full flex justify-between items-center p-2 px-4 bg-slate-100">
          <button className="flex gap-1" onClick={onOpen}>
            <i className="ri-add-line text-blue-700"></i>
            <p className="font-medium text-blue-700">Add collaborator</p>
          </button>
          <button onClick={() => setOpenSidebar(!openSidebar)} className="p-2">
            <i className="ri-group-fill"></i>
          </button>
        </header>
        <div className="conversation-area pt-3 pb-39 h-full flex flex-col">
          <div ref={messageBoxRef} className="message-box flex flex-grow flex-col overflow-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message min-w-56 flex flex-col p-2 rounded-md w-fit ${msg.isOutgoing ? 'ml-auto bg-blue-500 text-white' : 'bg-slate-100'
                  }`}
              >
                <small className="text-xs opacity-65">{msg.sender.email}</small>
                {msg.sender.user === '@ai' ? renderMessageContent(msg) : <p className="text-sm p-2 rounded-md mt-1 bg-black text-white">{msg.message}</p>}
              </div>
            ))}
          </div>
          <div className="input-field flex items-center bg-blue-700" style={{ width: '100%' }}>
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              type="text"
              className="flex-grow p-2 px-4 border-none outline-none text-blue-700"
              placeholder="Enter a message"
            />
            <button
              onClick={send}
              className="bg-blue-600 text-white p-2 px-4 rounded-r-md hover:bg-blue-500 flex items-center justify-center"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </section>

      <section className='right flex-grow flex h-full'>
        <div className="explorer max-w-64 min-w-52 h-full">
          <div className="file-tree w-full">
            {
              fileTree &&
              Object.keys(fileTree).map((file, index) => (
                <div className='tree-element flex items-center gap-2 p-2 px-4 bg-slate-100 cursor-pointer'>
                  <button
                    onClick={() => {
                      setCurrentFile(file);
                      setOpenFiles((prevFiles) => [...new Set([...prevFiles, file])]);
                    }}
                    className='font-semibold text-lg'>
                    {file}
                  </button>
                </div>
              ))
            }
          </div>
        </div>
        <div className="bottom w-full h-full">
          {fileTree && fileTree[currentFile]?.file?.contents ? (
            <div
              contentEditable
              className="w-full h-full bg-black text-white p-4 overflow-auto"
              style={{
                whiteSpace: "pre-wrap", // Preserve newlines and spacing
                wordBreak: "break-word", // Break long words if needed
                outline: "none", // Remove border when focused
              }}
              onInput={(e) => {
                const newContent = e.currentTarget.textContent; // Get updated content
                setFileTree({
                  ...fileTree,
                  [currentFile]: {
                    ...fileTree[currentFile], // Preserve file structure
                    file: {
                      contents: newContent.split('\n'), // Keep content as array of lines
                    },
                  },
                });
              }}
            >
              <pre className="language-javascript">
                <code
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      fileTree[currentFile]?.file?.contents.join('\n') || '', // Join array into string with newlines
                      Prism.languages.javascript, // Highlight as JavaScript
                      'javascript'
                    ),
                  }}
                ></code>
              </pre>
            </div>
          ) : (
            <p className="text-white">No content available.</p>
          )}
        </div>


      </section>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2" onClick={onClose} aria-label="Close">
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Select a User</h2>
            <ul className="space-y-2 overflow-y-auto max-h-60">
              {users.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className={`p-2 border rounded-md ${selectedUserId.includes(user._id) ? 'bg-blue-700 text-white' : ''} cursor-pointer`}
                >
                  {user.email}
                </li>
              ))}
            </ul>
            <button onClick={addCollaborators} className="bg-blue-700 text-white px-4 py-2 rounded-md mt-4">
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
