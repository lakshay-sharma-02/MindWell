import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
    setEditMode: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isEditMode, setIsEditMode] = useState(false);

    const toggleEditMode = () => setIsEditMode((prev) => !prev);
    const setEditMode = (value: boolean) => setIsEditMode(value);

    return (
        <AdminContext.Provider value={{ isEditMode, toggleEditMode, setEditMode }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
