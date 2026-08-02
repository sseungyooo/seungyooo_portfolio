import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://pdagzfdjtvgdkxunmqrc.supabase.co';
const supabasePublishableKey = 'sb_publishable_JWg-UVCLpHSTbckznJwp8g_ISYpJMyz';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
