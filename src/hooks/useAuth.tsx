import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  hasSeenTour: boolean;
  completeTour: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  checkIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true to prevent flash for existing users until loaded

  const checkIsAdmin = async (userId?: string): Promise<boolean> => {
    const checkId = userId || user?.id;
    if (!checkId) return false;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser?.email === 'psychespaced@gmail.com') {
        setIsAdmin(true);
        return true;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', checkId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      const hasAdmin = !!data;
      setIsAdmin(hasAdmin);
      return hasAdmin;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  const checkTourStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_tour')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        // If data exists, use value. If column missing (old schema), default to true to avoid crash? 
        // Actually if column missing, it might error. We should handle that.
        // For now, assume migration runs.
        setHasSeenTour(!!data.has_seen_tour);
      } else {
        // If profile missing, maybe creating? Default true to be safe?
        // Or false if we want to show it. Let's assume false for new users.
        setHasSeenTour(false);
      }
    } catch (e) {
      console.error("Error checking tour status:", e);
    }
  };

  const completeTour = async () => {
    setHasSeenTour(true);
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ has_seen_tour: true })
          .eq('id', user.id);
      } catch (e) {
        console.error("Failed to update tour status", e);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer extra checks
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              checkIsAdmin(session.user.id);
              checkTourStatus(session.user.id);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setHasSeenTour(true); // Don't show to guests
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            checkIsAdmin(session.user.id);
            checkTourStatus(session.user.id);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setHasSeenTour(true);
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        hasSeenTour,
        completeTour,
        signIn,
        signUp,
        signOut,
        updatePassword,
        checkIsAdmin: () => checkIsAdmin(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return safe defaults when used outside provider
    return {
      user: null,
      session: null,
      loading: false,
      isAdmin: false,
      hasSeenTour: true,
      completeTour: async () => { },
      signIn: async () => ({ error: new Error('AuthProvider not found') }),
      signUp: async () => ({ error: new Error('AuthProvider not found') }),
      signOut: async () => { },
      updatePassword: async () => ({ error: new Error('AuthProvider not found') }),
      checkIsAdmin: async () => false,
    };
  }
  return context;
}
