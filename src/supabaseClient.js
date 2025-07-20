// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Your Supabase project credentials
const supabaseUrl = 'https://jbohohgvpjybwqczffhd.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2hvaGd2cGp5YndxY3pmZmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODMwNzcsImV4cCI6MjA2ODM1OTA3N30.G_JxsFj_XphR3x0slTSqzKDb_VH9oM-qNmdUGO93Ezc';

// Create and export the client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
