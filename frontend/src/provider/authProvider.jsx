import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
    // State to hold the authentication token, initialized from localStorage
    const [token, setToken_] = useState(localStorage.getItem("token"));
    // Function to update the token state
    const setToken = (newToken) => {
        setToken_(newToken);
    };
    // Effect: Synchronize the token with Axios headers and localStorage
    useEffect(() => {
        if (token) {
            // Inject the token into all future API requests
            api.defaults.headers.common["Authorization"] = "Bearer " + token;
            localStorage.setItem("token", token);
        } else {
            // Clean up when logged out
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token]);
    // Memoized value avoids unnecessary re-renders of consuming components
    const contextValue = useMemo(
        () => ({
            token,
            setToken,
        }),
        [token]
    );
    // Provide the context to the rest of the application
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    return useContext(AuthContext);
};
export default AuthProvider;



