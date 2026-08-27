export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface SecureNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}
