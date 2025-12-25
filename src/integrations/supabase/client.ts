import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xnydaleepkwciwzlnxqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cmZkj5HjONVgrSws-vCt-A_8wh2Xpa7";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
