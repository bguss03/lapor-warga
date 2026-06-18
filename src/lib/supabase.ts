import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://bqqnfnyqxanekkznvzie.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcW5mbnlxeGFuZWtrem52emllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTQyNzMsImV4cCI6MjA5NjczMDI3M30.e1ZsdGbu0cg0n-l-8TDIh9uy0XgbEIdwfmeMJ43k_BM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
