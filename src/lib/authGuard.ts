import { supabase } from './supabase';

export const checkUserStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', userId)
    .single();

  if (data?.is_banned) {
    await supabase.auth.signOut();
    window.location.href = '/?error=banned';
    return false;
  }
  return true;
};
