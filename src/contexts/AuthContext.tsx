import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { lovable } from '../integrations/lovable/index';
import { LANGUAGES, type Profile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, classLevel: string, preferredLanguage: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEFAULT_CLASS = '9';
const DEFAULT_LANGUAGE = 'English';
const DEFAULT_STUDY_STYLE = 'detailed';

function safeLanguage(language?: string | null) {
  return LANGUAGES.includes(language as typeof LANGUAGES[number]) ? language! : DEFAULT_LANGUAGE;
}

function profileNameFromUser(authUser: User) {
  const meta = authUser.user_metadata || {};
  return meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Student';
}

function normalizeProfile(profile: Profile | null): Profile | null {
  if (!profile) return null;
  return {
    ...profile,
    full_name: profile.full_name || 'Student',
    class_level: profile.class_level || DEFAULT_CLASS,
    preferred_language: safeLanguage(profile.preferred_language),
    study_style: profile.study_style || DEFAULT_STUDY_STYLE,
    weak_subjects: profile.weak_subjects || [],
    streak_days: profile.streak_days || 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function ensureProfile(authUser: User, overrides: Partial<Profile> = {}) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(normalizeProfile(data as Profile));
        return;
      }

      const meta = authUser.user_metadata || {};
      const newProfile = {
        id: authUser.id,
        full_name: overrides.full_name || profileNameFromUser(authUser),
        class_level: overrides.class_level || meta.class_level || DEFAULT_CLASS,
        preferred_language: safeLanguage(overrides.preferred_language || meta.preferred_language),
        study_style: overrides.study_style || DEFAULT_STUDY_STYLE,
        weak_subjects: overrides.weak_subjects || [],
      };

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (createError) throw createError;
      setProfile(normalizeProfile(created as Profile));
    } catch (err) {
      console.warn('ensureProfile failed', err);
      setProfile({
        id: authUser.id,
        full_name: profileNameFromUser(authUser),
        class_level: DEFAULT_CLASS,
        preferred_language: DEFAULT_LANGUAGE,
        study_style: DEFAULT_STUDY_STYLE,
        weak_subjects: [],
        streak_days: 0,
        last_active_date: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string, classLevel: string, preferredLanguage: string) {
    const language = safeLanguage(preferredLanguage);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, class_level: classLevel, preferred_language: language },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return { error: error.message };

    if (data.user && data.session) {
      await ensureProfile(data.user, {
        full_name: fullName,
        class_level: classLevel,
        preferred_language: language,
      });
    }

    return {};
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signInWithGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
        extraParams: { prompt: 'select_account' },
      });

      if (result.redirected) return {};
      if (result.error) return { error: result.error.message };

      const { data: { user: authedUser }, error } = await supabase.auth.getUser();
      if (error) return { error: error.message };
      if (authedUser) await ensureProfile(authedUser);
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return {};
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
