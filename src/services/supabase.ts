import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://esmwoucfrslxrxtmnxxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbXdvdWNmcnNseHJ4dG1ueHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDIwOTYsImV4cCI6MjA5MDExODA5Nn0.HUYE_ef8Awvz3PW30Ke5ngS3jqZcaCmjEKh0C2Nm-8E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const signIn = async (email: string, password: string) => {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};


export const signOut = async () => {
  // If we have a real session...
  const {data} = await supabase.auth.getSession();
  if (data.session) {
    const {error} = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const getCurrentUser = async () => {
  const {data: {user}} = await supabase.auth.getUser();
  return user;
};

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string) => {

  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const getAllProfiles = async () => {
  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data;
};

export const createProfile = async (profile: {
  id: string;
  email: string;
  name: string;
  username?: string;
  school_id: string;
  roll_number?: string;
  parent_mobile?: string;
  personal_detail_1?: string;
  personal_detail_2?: string;
  dob?: string;
  must_change_password?: boolean;
}) => {
  const {data, error} = await supabase.from('profiles').insert([profile]).select().single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (
  id: string,
  updates: Partial<{
    name: string; 
    role: string; 
    email: string; 
    school_id: string; 
    class_name: string; 
    username: string;
    roll_number: string;
    parent_mobile: string;
    personal_detail_1: string;
    personal_detail_2: string;
    dob: string;
    must_change_password: boolean;
  }>,
) => {
  const {data, error} = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProfile = async (id: string) => {
  const {error} = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  const { error } = await supabase.rpc('admin_reset_password', {
    target_user_id: userId,
    new_password: newPassword,
  });
  if (error) throw error;
};

// ─── AR Models CRUD ───────────────────────────────────────────────────────────

export const getARModels = async (category?: string) => {
  let query = supabase
    .from('ar_models')
    .select('*, profiles(name)')
    .order('created_at', {ascending: false});
  if (category) {
    query = query.eq('category', category);
  }
  const {data, error} = await query;
  if (error) throw error;
  return data;
};

export const createARModel = async (model: {
  title: string;
  description: string;
  category: string;
  model_url: string;
  thumbnail_url?: string;
  teacher_id: string;
  subcategory?: string;
}) => {
  const {data, error} = await supabase
    .from('ar_models')
    .insert([model])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteARModel = async (id: string) => {
  const {error} = await supabase.from('ar_models').delete().eq('id', id);
  if (error) throw error;
};

// ─── School & Class Management ────────────────────────────────────────────────
export const getSchools = async () => {
  const {data, error} = await supabase.from('schools').select('*').order('name');
  if (error) throw error;
  return data;
};

export const getClassesInSchool = async (schoolId: string) => {
  const {data, error} = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId)
    .order('class_name');
  if (error) throw error;
  return data;
};

export const createSchool = async (school: {name: string; code: string}) => {
  const {data, error} = await supabase.from('schools').insert([school]).select().single();
  if (error) throw error;
  return data;
};

export const createClass = async (classData: {school_id: string; class_name: string}) => {
  const {data, error} = await supabase.from('classes').insert([classData]).select().single();
  if (error) throw error;
  return data;
};

export const deleteSchool = async (id: string) => {
  const {error} = await supabase.from('schools').delete().eq('id', id);
  if (error) throw error;
};

export const deleteClass = async (id: string) => {
  const {error} = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
};

// ─── Storage ──────────────────────────────────────────────────────────────────

export const uploadModelFile = async (
  filePath: string,
  fileContent: ArrayBuffer,
  mimeType: string,
): Promise<string> => {
  const {data, error} = await supabase.storage
    .from('ar-models')
    .upload(filePath, fileContent, {contentType: mimeType, upsert: true});
  if (error) throw error;
  const {data: urlData} = supabase.storage
    .from('ar-models')
    .getPublicUrl(data.path);
  return urlData.publicUrl;
};

export const deleteModelFile = async (filePath: string) => {
  const {error} = await supabase.storage.from('ar-models').remove([filePath]);
  if (error) throw error;
};
