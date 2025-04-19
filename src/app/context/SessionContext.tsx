"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Nurse {
  id: string;
  full_name: string;
  position: string;
  email: string;
  signature: string;
  created_at: string;
  updated_at: string;
}

interface SessionContextType {
  selectedNurse: Nurse | null;
  setSelectedNurse: (nurse: Nurse | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [selectedNurse, setSelectedNurseState] = useState<Nurse | null>(() => {
    if (typeof window !== 'undefined') {
      const savedNurse = localStorage.getItem('selectedNurse');
      return savedNurse ? JSON.parse(savedNurse) : null;
    }
    return null;
  });

  // Update localStorage whenever selectedNurse changes
  const setSelectedNurse = (nurse: Nurse | null) => {
    setSelectedNurseState(nurse);
    if (typeof window !== 'undefined') {
      if (nurse) {
        localStorage.setItem('selectedNurse', JSON.stringify(nurse));
      } else {
        localStorage.removeItem('selectedNurse');
      }
    }
  };

  return (
    <SessionContext.Provider value={{ selectedNurse, setSelectedNurse }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
} 