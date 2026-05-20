import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  schoolName?: string;
  schoolAddress?: string;
  monetagLink?: string;
  isAdmin?: boolean;
  isPro?: boolean;
  dailyGenerations?: number;
  lastGenerationDate?: string;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Initial setup/sync
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            const newProfile: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            if (currentUser.displayName) newProfile.displayName = currentUser.displayName;
            if (currentUser.photoURL) newProfile.photoURL = currentUser.photoURL;
            await setDoc(userRef, newProfile);
          } else {
            const existingData = userDoc.data();
            const updates: any = {};
            if (currentUser.displayName && existingData?.displayName !== currentUser.displayName) {
              updates.displayName = currentUser.displayName;
            }
            if (currentUser.photoURL && existingData?.photoURL !== currentUser.photoURL) {
              updates.photoURL = currentUser.photoURL;
            }
            if (Object.keys(updates).length > 0) {
              updates.updatedAt = serverTimestamp();
              await updateDoc(userRef, updates);
            }
          }
        } catch (error) {
          console.error("Profile sync error:", error);
        }

        // Listen for profile changes
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
