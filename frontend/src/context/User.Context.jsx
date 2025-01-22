import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  return (
    <UserContext.Provider value={{ user, token, setToken, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const userTheme = () => {
  return useContext(UserContext);
};
