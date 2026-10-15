import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../services/firebase';
import { AppUserProfile, UserRole, DEMO_USER_PROFILES } from '../services/firestoreSync';

interface AuthContextType {
  user: User | null;
  profile: AppUserProfile;
  role: UserRole;
  isFirebaseAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  switchDemoProfile: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileDetails: (updates: Partial<AppUserProfile>) => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('duli_active_role');
      if (saved && saved in DEMO_USER_PROFILES) return saved as UserRole;
    } catch {}
    return 'gestao'; // default to hospital management ERP
  });

  const [profile, setProfile] = useState<AppUserProfile>(() => {
    try {
      const saved = localStorage.getItem('duli_active_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_USER_PROFILES[role];
  });

  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setAuthLoading(false);

      if (fbUser) {
        // Fetch or create profile in Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data() as AppUserProfile;
            setProfile(data);
            setRoleState(data.role || 'cliente');
          } else {
            // New user defaults to patient/cliente or keeps active selection
            const newProfile: AppUserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Usuário Autenticado',
              email: fbUser.email || 'usuario@hospital.gov.br',
              role: role,
              avatarUrl: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore, using local fallback:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [role]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('duli_active_role', role);
      localStorage.setItem('duli_active_profile', JSON.stringify(profile));
    } catch {}
  }, [role, profile]);

  const switchDemoProfile = async (targetRole: UserRole) => {
    setRoleState(targetRole);
    const demo = DEMO_USER_PROFILES[targetRole];
    setProfile(demo);

    // If authenticated in Firebase, update Firestore user doc
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { ...profile, role: targetRole, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Firestore role sync notice:', err);
      }
    }
  };

  const setRole = (newRole: UserRole) => {
    switchDemoProfile(newRole);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      // Revert to demo profile of current role
      setProfile(DEMO_USER_PROFILES[role]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfileDetails = async (updates: Partial<AppUserProfile>) => {
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isFirebaseAuthenticated: Boolean(user),
        setRole,
        switchDemoProfile,
        signInWithGoogle,
        signOut,
        updateProfileDetails,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
