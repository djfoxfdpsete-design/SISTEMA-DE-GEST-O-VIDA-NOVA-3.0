import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwxxvhppjqkmdxtzvxto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHh2aHBwanFrbWR4dHp2eHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODY3MTEsImV4cCI6MjA4OTA2MjcxMX0.JdP3SrNTHw3jdRnHA1RdAdH4IdoNRGHesb2bSQ5WRdc';

export const supabase = createClient(supabaseUrl, supabaseKey);
