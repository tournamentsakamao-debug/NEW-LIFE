import { supabase } from './supabase';

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

export async function checkMaintenanceMode() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('maintenance_mode')
      .single();

    if (error) throw error;
    return data?.maintenance_mode || false;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
}

export async function isUserBanned(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_banned, banned_reason')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      isBanned: data?.is_banned || false,
      reason: data?.banned_reason || '',
    };
  } catch (error) {
    console.error('Error checking ban status:', error);
    return { isBanned: false, reason: '' };
  }
}
