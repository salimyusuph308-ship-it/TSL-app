import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

export type UserRole = 'patient' | 'professional';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  preferred_language: string;
  font_size: 'small' | 'medium' | 'large';
}

export interface HistoryEntry {
  id: number;
  user_id: string;
  type: 'request' | 'instruction';
  content: string;
  tsl_description?: string;
  timestamp: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  history: HistoryEntry[];
  frequentSigns: any[];
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addHistoryEntry: (type: 'request' | 'instruction', content: string, tsl_description?: string) => Promise<void>;
  trackSignUsage: (signId: string) => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [frequentSigns, setFrequentSigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setLanguage } = useLanguage();

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/profile/${userId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.preferred_language) {
          setLanguage(data.preferred_language as any);
        }
      } else if (res.status === 404) {
        // Create default profile if not found
        const defaultProfile: UserProfile = {
          id: userId,
          name: 'New User',
          role: 'patient',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          preferred_language: 'en',
          font_size: 'medium'
        };
        await fetch(`${window.location.origin}/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultProfile)
        });
        setProfile(defaultProfile);
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      console.error(`Failed to fetch profile (Attempt ${retryCount + 1}):`, err);
      if (retryCount < 5) {
        // Wait 2s before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchProfile(userId, retryCount + 1);
      }
    }
  }, [setLanguage]);

  const fetchHistory = useCallback(async (userId: string, retryCount = 0) => {
    try {
      const res = await fetch(`${window.location.origin}/api/history/${userId}`);
      if (res.ok) {
        setHistory(await res.json());
      } else {
        console.error(`Failed to fetch history: ${res.status} ${res.statusText}`);
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchHistory(userId, retryCount + 1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history (network error):", err);
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchHistory(userId, retryCount + 1);
      }
    }
  }, []);

  const fetchFrequent = useCallback(async (userId: string, retryCount = 0) => {
    try {
      const res = await fetch(`${window.location.origin}/api/frequent/${userId}`);
      if (res.ok) {
        setFrequentSigns(await res.json());
      } else {
        console.error(`Failed to fetch frequent signs: ${res.status} ${res.statusText}`);
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchFrequent(userId, retryCount + 1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch frequent signs (network error):", err);
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchFrequent(userId, retryCount + 1);
      }
    }
  }, []);

  useEffect(() => {
    let userId = localStorage.getItem('afyasign_user_id');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('afyasign_user_id', userId);
    }

    const init = async () => {
      // Small delay to ensure server is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(true);
      try {
        await fetchProfile(userId!);
        await fetchHistory(userId!);
        await fetchFrequent(userId!);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [fetchProfile, fetchHistory, fetchFrequent]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    try {
      const res = await fetch(`${window.location.origin}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      if (res.ok) {
        setProfile(newProfile);
        if (updates.preferred_language) {
          setLanguage(updates.preferred_language as any);
        }
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const addHistoryEntry = async (type: 'request' | 'instruction', content: string, tsl_description?: string) => {
    if (!profile) return;
    try {
      const res = await fetch(`${window.location.origin}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          type,
          content,
          tsl_description
        })
      });
      if (res.ok) {
        fetchHistory(profile.id);
      }
    } catch (err) {
      console.error("Failed to add history entry:", err);
    }
  };

  const trackSignUsage = async (signId: string) => {
    if (!profile) return;
    try {
      const res = await fetch(`${window.location.origin}/api/frequent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          sign_id: signId
        })
      });
      if (res.ok) {
        fetchFrequent(profile.id);
      }
    } catch (err) {
      console.error("Failed to track sign usage:", err);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, history, frequentSigns, updateProfile, addHistoryEntry, trackSignUsage, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
