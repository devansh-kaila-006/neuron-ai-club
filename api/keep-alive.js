import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // If CRON_SECRET is configured in Vercel, verify the authorization header to prevent spamming
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized: Invalid cron trigger.' });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ 
      error: 'Supabase credentials are not configured in Vercel environment variables. Please add SUPABASE_URL and SUPABASE_ANON_KEY.' 
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Ping the 'teams' table to trigger database activity externally
    const { data, error } = await supabase.from('teams').select('id').limit(1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Supabase kept active successfully via Vercel scheduled cron.',
      timestamp: new Date().toISOString(),
      pinged: true
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Database ping failure.'
    });
  }
}
