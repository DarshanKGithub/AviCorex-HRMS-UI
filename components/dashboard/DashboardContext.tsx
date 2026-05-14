'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DashboardSection = 'overview' | 'dashboard' | 'calendar' | 'delegation' | 'activities';
type DashboardSpace = 'my-space' | 'organization';

interface DashboardContextType {
  currentSpace: DashboardSpace;
  setCurrentSpace: (space: DashboardSpace) => void;
  
  currentSection: DashboardSection;
  setCurrentSection: (section: DashboardSection) => void;
  
  refreshKey: number;
  triggerRefresh: () => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentSpace, setCurrentSpace] = useState<DashboardSpace>('my-space');
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Persist space preference to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('hrms_dashboard_space');
    if (saved === 'organization' || saved === 'my-space') {
      setCurrentSpace(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('hrms_dashboard_space', currentSpace);
  }, [currentSpace]);

  // Reset section to overview when space changes
  useEffect(() => {
    setCurrentSection('overview');
  }, [currentSpace]);

  return (
    <DashboardContext.Provider
      value={{
        currentSpace,
        setCurrentSpace,
        currentSection,
        setCurrentSection,
        refreshKey,
        triggerRefresh,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
