import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST requests for letter generation
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Capsule ID is required' });
  }

  // 1. Resolve Supabase Environment Variables
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

  if (!geminiApiKey) {
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY is not configured in Vercel. Please add it to your environment secrets.',
      diagnostics: {
        SUPABASE_URL_CONFIGURED: !!supabaseUrl,
        SUPABASE_ANON_KEY_CONFIGURED: !!supabaseAnonKey,
        GEMINI_API_KEY_CONFIGURED: false
      }
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      success: false,
      error: 'Supabase credentials are not configured in Vercel. Cannot fetch or save the generated letter.',
      diagnostics: {
        SUPABASE_URL_CONFIGURED: !!supabaseUrl,
        SUPABASE_ANON_KEY_CONFIGURED: !!supabaseAnonKey,
        GEMINI_API_KEY_CONFIGURED: true
      }
    });
  }

  // 2. Format Supabase URL
  let cleanUrl = supabaseUrl.replace(/\/$/, "");
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    if (/^[a-zA-Z0-9-]{10,}$/.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}.supabase.co`;
    } else {
      cleanUrl = `https://${cleanUrl}`;
    }
  }

  try {
    // 3. Fetch capsule from Supabase
    const fetchUrl = `${cleanUrl}/rest/v1/capsules?id=eq.${id}&select=*`;
    const fetchResponse = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Failed to fetch capsule from Supabase (status ${fetchResponse.status}): ${errorText}`);
    }

    const capsules = await fetchResponse.json();
    if (!capsules || capsules.length === 0) {
      throw new Error(`Capsule with ID ${id} not found in database.`);
    }

    const capsule = capsules[0];
    const graduationYear = (capsule.cohort_year || 2026) + 4;

    // 4. Initialize Gemini API Client
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // 5. Structure the prompt for gemini-3.5-flash
    const prompt = `
      Write a warm, deeply inspiring, and slightly futuristic/cyber-themed personal letter for an AI Time Capsule.
      The letter is from the "NEURØN Core Command" (the Artificial Intelligence Community at Amrita Vishwa Vidyapeetham) addressed to the student.
      It should look back from their starting cohort year of ${capsule.cohort_year || 2026} to their graduation in the year ${graduationYear}.

      Student Details:
      - Name: ${capsule.full_name}
      - Branch/Major: ${capsule.branch || 'their selected engineering major'}
      - Enrollment Number: ${capsule.enrollment_no}
      - Q1 (Who they want to become / career aspirations): "${capsule.q1_answer}"
      - Q2 (Tech/world predictions for the year ${graduationYear}): "${capsule.q2_answer}"
      - Q3 (Private advice to their future self): "${capsule.q3_answer}"

      Structure & Guidelines:
      - Format as an official cyber-sealed digital letter.
      - Start with a personalized greeting: "Greetings, ${capsule.full_name}," or "Dear ${capsule.full_name},"
      - Introduce the letter as a transmission compiled and sealed by NEURØN in ${capsule.cohort_year || 2026}, now traveling across time to meet them at graduation in ${graduationYear}.
      - Discuss their professional/career aspirations (Q1). Weave it in naturally, treating their goals with visionary encouragement and showing how much NEURØN believes in their potential to shape the cybernetic world.
      - Reflect on their tech predictions for ${graduationYear} (Q2). Contrast it with the accelerating speed of technological advancement (e.g., neural interfaces, quantum architectures, space engineering), validating their foresight.
      - Gently touch upon the private advice they wrote to themselves (Q3), reminding them to hold onto their core values, their Amrita heritage, their curiosity, and the late-night canteen sessions that fueled their start. Keep the reference respectful, insightful, and highly motivating.
      - Conclude with an inspiring final statement urging them to continue coding the future.
      - Sign off with a futuristic closing:
        "Sealed in digital transit,
        The NEURØN Core Unit, Cohort of ${capsule.cohort_year || 2026}"
      - Tone: Warm, visionary, inspiring, intellectual, with standard NEURØN cyber-branding (futuristic, dark-mode, synthetic intelligence aesthetic).
      - Do NOT include any markdown code block wraps (like \`\`\`markdown or \`\`\`text). Just return the direct, pure letter content.
      - Length: Approximately 300 to 400 words.
    `;

    // 6. Generate the content using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    const letter = response.text || '';

    if (!letter.trim()) {
      throw new Error('Gemini model returned an empty text payload.');
    }

    // 7. Update capsule in Supabase
    const updateUrl = `${cleanUrl}/rest/v1/capsules?id=eq.${id}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ai_generated_letter: letter,
        status: 'generated'
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update capsule with generated letter (status ${updateResponse.status}): ${errorText}`);
    }

    return res.status(200).json({
      success: true,
      message: 'AI letter generated and saved successfully.',
      letter: letter
    });

  } catch (err) {
    console.error('generate-capsules API Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An internal error occurred during letter generation.'
    });
  }
}
