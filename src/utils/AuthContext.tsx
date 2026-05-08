import React, {createContext, useContext, useState, useEffect} from 'react';
import {supabase, getUserProfile, signOut} from '../services/supabase';
import {User} from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (supabaseUser: any) => {
    try {
      const profile = await getUserProfile(supabaseUser.id);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || 'User',
        role: profile?.role || 'student',
        school_id: profile?.school_id || '',
        class_name: profile?.class_name,
        username: profile?.username,
        must_change_password: profile?.must_change_password ?? false,
        created_at: profile?.created_at || '',
      });
    } catch {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const {data: {user: sbUser}} = await supabase.auth.getUser();
    if (sbUser) {
      await loadUser(sbUser);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      if (session?.user) {
        loadUser(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, logout, refreshUser, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
