import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ilcbluyhkljehkcgqfjm.supabase.co";
const supabaseAnonKey = "sb_publishable_3SouOOm3tvSi_dfzgH9YIw_1VLuki-r";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
