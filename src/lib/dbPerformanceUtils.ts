
import { supabase } from '@/integrations/supabase/client';

// Save quiz attempt to database
export const saveQuizAttemptToDb = async (attempt: {
  grade: string;
  subject: string;
  chapter: string;
  difficulty: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // quiz_attempts table not yet created - store in localStorage fallback
  try {
    const key = 'ethioquiz_performance';
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { attempts: [] };
    data.attempts.push({ ...attempt, user_id: user.id, attempted_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(data));
    return attempt;
  } catch (e) {
    console.error('Error saving quiz attempt:', e);
    return null;
  }
};

// Get quiz attempts from database
export const getQuizAttemptsFromDb = async (limit?: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const key = 'ethioquiz_performance';
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const data = JSON.parse(stored);
    const attempts = (data.attempts || []).filter((a: any) => a.user_id === user.id);
    return limit ? attempts.slice(0, limit) : attempts;
  } catch (e) {
    console.error('Error fetching quiz attempts:', e);
    return [];
  }
};

// Get user profile from database
export const getProfileFromDb = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const key = 'ethioquiz_profile';
    const stored = localStorage.getItem(key);
    if (!stored) return { student_name: user.email?.split('@')[0] || '' };
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error fetching profile:', e);
    return null;
  }
};

// Update user profile
export const updateProfileInDb = async (updates: { student_name?: string; avatar_url?: string }) => {
  try {
    const key = 'ethioquiz_profile';
    const stored = localStorage.getItem(key);
    const profile = stored ? JSON.parse(stored) : {};
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating profile:', e);
    return null;
  }
};

// Migrate localStorage data to database (no-op for now)
export const migrateLocalDataToDb = async () => {
  // Will be implemented when quiz_attempts and profiles tables are created
};
