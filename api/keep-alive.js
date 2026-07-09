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
      error: 'Supabase credentials are not configured in Vercel environment variables. Please add SUPABASE_URL and SUPABASE_ANON_KEY.',
      envStatus: {
        SUPABASE_URL_CONFIGURED: !!supabaseUrl,
        SUPABASE_ANON_KEY_CONFIGURED: !!supabaseAnonKey
      }
    });
  }

  try {
    // Format the Supabase URL correctly and fetch from teams table
    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const pingUrl = `${cleanUrl}/rest/v1/teams?select=id&limit=1`;

    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Supabase kept active successfully via Vercel scheduled cron (Native Fetch).',
      timestamp: new Date().toISOString(),
      pinged: true,
      recordsFound: data.length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Database ping failure.'
    });
  }
}
