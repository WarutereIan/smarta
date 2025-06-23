import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithPhone: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Development mode flag - set to false for production
const isDevelopment = import.meta.env.DEV;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPhone = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDevelopment) {
        // Development mode: Just store the phone number for OTP verification
        localStorage.setItem('pendingPhone', phone);
        localStorage.setItem('devMode', 'true');
        return true;
      } else {
        // Production mode: Use Supabase SMS OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            channel: 'sms',
          },
        });

        if (error) throw error;
        
        localStorage.setItem('pendingPhone', phone);
        return true;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDevelopment && localStorage.getItem('devMode') === 'true') {
        // Development mode: Accept any 6-digit code
        if (otp.length === 6 && /^\d+$/.test(otp)) {
          // Create a mock user session
          const mockUser = {
            id: `dev-user-${Date.now()}`,
            phone: phone,
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
          } as User;
          
          setUser(mockUser);
          localStorage.removeItem('pendingPhone');
          localStorage.removeItem('devMode');
          return true;
        } else {
          setError('Please enter a 6-digit verification code');
          return false;
        }
      } else {
        // Production mode: Use Supabase OTP verification
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms',
        });

        if (error) throw error;
        
        if (data.user) {
          localStorage.removeItem('pendingPhone');
          return true;
        } else {
          setError('Invalid verification code');
          return false;
        }
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDevelopment && user?.id?.startsWith('dev-user-')) {
        // Development mode: Just clear the mock user
        setUser(null);
        localStorage.removeItem('devMode');
      } else {
        // Production mode: Use Supabase sign out
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithPhone,
    verifyOtp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
