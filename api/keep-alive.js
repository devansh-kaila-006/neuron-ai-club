export default async function handler(req, res) {
  // If CRON_SECRET is configured in Vercel, verify the authorization header to prevent spamming
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ 
        error: 'Unauthorized: Invalid cron trigger.',
        tip: 'Ensure your request includes the header: Authorization: Bearer <YOUR_CRON_SECRET>'
      });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ 
      success: false,
      error: 'Supabase credentials are missing in your Vercel environment variables.',
      envDiagnostics: {
        SUPABASE_URL_CONFIGURED: !!supabaseUrl,
        SUPABASE_ANON_KEY_CONFIGURED: !!supabaseAnonKey,
        CRON_SECRET_CONFIGURED: !!cronSecret
      },
      actionRequired: 'Please go to your Vercel Project Settings > Environment Variables, and add SUPABASE_URL and SUPABASE_ANON_KEY.'
    });
  }

  // Format the Supabase URL correctly
  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  // Try querying the teams table first, with a fallback to the root API endpoint
  // This ensures the ping succeeds even if the teams table doesn't exist!
  try {
    const pingUrl = `${cleanUrl}/rest/v1/teams?select=id&limit=1`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        message: 'Database kept active successfully (Primary Table Ping).',
        timestamp: new Date().toISOString(),
        tablePing: 'success',
        records: data.length
      });
    }

    // Fallback: Query the root API endpoint (always exists on Supabase PostgREST)
    const rootUrl = `${cleanUrl}/rest/v1/`;
    const fallbackResponse = await fetch(rootUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text();
      throw new Error(`Supabase PostgREST API responded with status ${fallbackResponse.status}: ${errorText}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Database kept active successfully (Schema Root Fallback Ping).',
      timestamp: new Date().toISOString(),
      fallbackPing: 'success'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Database ping failure.',
      diagnostics: {
        supabaseUrlConfigured: !!supabaseUrl,
        supabaseUrlValue: supabaseUrl ? `${cleanUrl.substring(0, 15)}...` : null,
        timestamp: new Date().toISOString()
      }
    });
  }
}
