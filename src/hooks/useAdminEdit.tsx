import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminEditContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
}

const AdminEditContext = createContext<AdminEditContextType | null>(null);

export function AdminEditProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  return (
    <AdminEditContext.Provider value={{ isAdmin, isEditMode, toggleEditMode }}>
      {children}
    </AdminEditContext.Provider>
  );
}

export function useAdminEdit() {
  const context = useContext(AdminEditContext);
  if (!context) {
    return { isAdmin: false, isEditMode: false, toggleEditMode: () => {} };
  }
  return context;
}
