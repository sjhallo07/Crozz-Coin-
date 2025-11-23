import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { isInsecureToken } from "../constants/config";

type UserRole = "admin" | "user";

interface UserRoleContextType {
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within UserRoleProvider");
  }
  return context;
};

interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider = ({ children }: UserRoleProviderProps) => {
  // Check if admin token is configured to determine default role
  const hasAdminToken = !isInsecureToken(import.meta.env.VITE_CROZZ_ADMIN_TOKEN);
  
  // Load role from localStorage or default to "user"
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("crozz_user_role");
    if (saved === "admin" || saved === "user") {
      return saved;
    }
    // If admin token is configured, default to admin mode, otherwise user mode
    return hasAdminToken ? "admin" : "user";
  });

  // Save role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("crozz_user_role", role);
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const toggleRole = () => {
    setRoleState((prev) => (prev === "admin" ? "user" : "admin"));
  };

  const value: UserRoleContextType = {
    role,
    isAdmin: role === "admin",
    isUser: role === "user",
    setRole,
    toggleRole,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};
