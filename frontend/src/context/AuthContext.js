import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  function convertUserRoles(inputString) {
    if (inputString === 3) {
        return 'Normal';
    } else if (inputString === 1) {
        return 'Admin';
    } else if (inputString === 4) {
        return 'Premium';
    }

    return null;
  }

  useEffect(() => {
    // Read from sessionStorage instead of localStorage
    const storedUsername = sessionStorage.getItem("username");
    const storedUserID = sessionStorage.getItem("userID");
    const storedRole = sessionStorage.getItem("role");

    if (storedUsername && storedUserID && !user) {
      setUser({
        username: storedUsername,
        userID: parseInt(storedUserID, 10),
        role: storedRole
      });
    }
    setLoading(false);
  }, [user]);

  const login = async (userData) => {
    try {

      const stringRole = await convertUserRoles(userData.role);

      const newUser = {
        username: userData.username,
        userID: userData.ID,
        role: stringRole
      };
      setUser(newUser);

      // Store in sessionStorage
      sessionStorage.setItem("username", newUser.username);
      sessionStorage.setItem("userID", newUser.userID.toString());
      sessionStorage.setItem("role", stringRole);

      return true;
    } catch (error) {
      console.error("Eroare la logare", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);

      // Remove from sessionStorage
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userID");
      sessionStorage.removeItem("role");
    } catch (error) {
      console.error("Eroare la delogare", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
