import { supabase } from './storage.ts';
import { TeamPassport, PassportMember, StampTier, PassportTask } from './types.ts';
import { registrationMutex, passportUpdateMutex } from './concurrency.ts';

const STORAGE_KEY = 'neuron_team_passports_v1';

// 6 Official Passport Tasks required for each team
export const OFFICIAL_PASSPORT_TASKS: PassportTask[] = [
  {
    id: 'task-1',
    title: 'Morse Code',
    description: 'Decode and transmit cyber signal patterns using Morse code sequences.',
    category: 'Communication',
    iconName: 'Cpu'
  },
  {
    id: 'task-2',
    title: 'AI vs Human',
    description: 'Compete in live cognitive and prompt challenge rounds testing human vs synthetic intelligence.',
    category: 'Cognitive',
    iconName: 'Sparkles'
  },
  {
    id: 'task-3',
    title: 'Chits Make an Image',
    description: 'Assemble physical/digital prompt chits and tokens to re-create exact target visual art.',
    category: 'Creativity',
    iconName: 'Palette'
  },
  {
    id: 'task-4',
    title: 'Quiz',
    description: 'Rapid-fire technical and neural intelligence challenge covering AI, cybernetics, and computer science.',
    category: 'Trivia',
    iconName: 'Database'
  },
  {
    id: 'task-5',
    title: 'Chinese Whisper',
    description: 'Pass complex algorithmic prompts down a chain of participants to test message integrity.',
    category: 'Transmission',
    iconName: 'ShieldCheck'
  },
  {
    id: 'task-6',
    title: 'Human Intelligence Test',
    description: 'Solve high-order logic puzzles, spatial reasoning tasks, and multi-layered cyber paradoxes.',
    category: 'Logic',
    iconName: 'Trophy'
  }
];

export const STAMP_POINTS: Record<string, number> = {
  gold: 10,
  silver: 7,
  bronze: 5
};

// Helper for input sanitization against XSS and injection attacks
export const sanitizeText = (input: string, maxLength: number = 100): string => {
  if (!input) return '';
  return input
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip HTML tags
    .replace(/[<>"']/g, '')         // Remove dangerous quotes/brackets
    .replace(/[\x00-\x1F\x7F]/g, '')// Remove control chars
    .trim()
    .slice(0, maxLength);
};

export const validateEnrollmentNo = (enrollNo: string): boolean => {
  if (!enrollNo) return true; // optional field
  // Allow alphanumeric, dots, hyphens, slashes, spaces (e.g. AM.EN.U4CSE23010)
  return /^[A-Za-z0-9.\-\/\s]{3,30}$/.test(enrollNo);
};

// Default seed team passports (empty by default for clean real registrations)
const DEFAULT_MOCK_PASSPORTS: TeamPassport[] = [];

export const calculatePassportPoints = (stamps: Record<string, StampTier>): number => {
  if (!stamps) return 0;
  return Object.values(stamps).reduce((acc, tier) => {
    if (!tier) return acc;
    return acc + (STAMP_POINTS[tier] || 0);
  }, 0);
};

export const passportService = {
  isUsingMock: false,

  initLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } else {
      try {
        const existing: TeamPassport[] = JSON.parse(raw);
        const filtered = existing.filter(p => !p.id.startsWith('pass-mock-'));
        if (filtered.length !== existing.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    }
  },

  async getPassports(): Promise<TeamPassport[]> {
    this.initLocalStorage();
    const localData: TeamPassport[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (!supabase) {
      this.isUsingMock = true;
      return localData;
    }

    try {
      const { data, error } = await supabase
        .from('team_passports')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) {
        console.warn('Supabase team_passports table not accessible, using local storage:', error.message);
        this.isUsingMock = true;
        return localData;
      }

      this.isUsingMock = false;

      // Ensure scores are synced and accurate
      const dbPassports = (data || []).map((p: any) => ({
        ...p,
        total_points: calculatePassportPoints(p.stamps || {})
      }));

      // Merge local mock entries if DB is empty
      if (dbPassports.length === 0) {
        return localData;
      }

      // Sync local storage cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPassports));
      return dbPassports;
    } catch (err) {
      console.warn('Error querying team_passports, using local cache:', err);
      this.isUsingMock = true;
      return localData;
    }
  },

  async getPassportByCodeOrId(codeOrId: string): Promise<TeamPassport | null> {
    const all = await this.getPassports();
    const target = codeOrId.trim().toUpperCase();
    
    return all.find(p => 
      p.id.toUpperCase() === target || 
      p.passport_code.toUpperCase() === target ||
      p.team_name.toUpperCase() === target
    ) || null;
  },

  async createTeamPassport(teamName: string, members: Omit<PassportMember, 'id'>[]): Promise<TeamPassport> {
    return registrationMutex.runExclusive(async () => {
      const cleanTeamName = sanitizeText(teamName, 60);
      if (!cleanTeamName || cleanTeamName.length < 2) {
        throw new Error('Please enter a valid Team Name (at least 2 characters).');
      }

      if (members.length < 3 || members.length > 6) {
        throw new Error('A team must consist of between 3 and 6 members.');
      }

      const formattedMembers: PassportMember[] = members.map((m, idx) => {
        const cleanName = sanitizeText(m.name, 60);
        const cleanEnrollment = sanitizeText(m.enrollment_no || '', 30).toUpperCase();
        const cleanRole = sanitizeText(m.role || '', 50);
        const cleanEmail = sanitizeText(m.email || '', 100);

        if (!cleanName) {
          throw new Error(`Member #${idx + 1} must have a valid name.`);
        }

        if (cleanEnrollment && !validateEnrollmentNo(cleanEnrollment)) {
          throw new Error(`Member #${idx + 1} enrollment number contains invalid characters.`);
        }

        return {
          id: `mem-${Date.now()}-${idx}`,
          name: cleanName,
          enrollment_no: cleanEnrollment,
          role: cleanRole || undefined,
          email: cleanEmail || undefined
        };
      });

      this.initLocalStorage();
      const cohortYear = new Date().getFullYear();

      // Check existing passports inside mutex lock for duplicate team names
      const existing = await this.getPassports();
      const nameExists = existing.some(
        p => p.team_name.trim().toLowerCase() === cleanTeamName.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`A squad named "${cleanTeamName}" is already registered.`);
      }

      let cohortCount = existing.filter(p => p.cohort_year === cohortYear).length;
      let attempts = 0;
      let finalPassport: TeamPassport | null = null;

      const initialStamps: Record<string, StampTier> = {
        'task-1': null,
        'task-2': null,
        'task-3': null,
        'task-4': null,
        'task-5': null,
        'task-6': null
      };

      // Retry loop to handle concurrent code collisions
      while (attempts < 5 && !finalPassport) {
        attempts++;
        cohortCount++;
        const nextCode = `NRNPASS-${cohortYear}-${String(cohortCount).padStart(4, '0')}`;

        const candidatePassport: TeamPassport = {
          id: `pass-${Math.random().toString(36).substring(2, 11)}`,
          passport_code: nextCode,
          team_name: cleanTeamName,
          cohort_year: cohortYear,
          members: formattedMembers,
          stamps: initialStamps,
          total_points: 0,
          created_at: new Date().toISOString()
        };

        // Try inserting into Supabase first if available
        if (supabase && !this.isUsingMock) {
          try {
            const { id, ...payload } = candidatePassport;
            const { data, error } = await supabase
              .from('team_passports')
              .insert([payload])
              .select()
              .single();

            if (!error && data) {
              const synced = { ...data, total_points: calculatePassportPoints(data.stamps) };
              // Sync local storage cache
              const localData: TeamPassport[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
              localData.unshift(synced);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
              finalPassport = synced;
              break;
            } else if (error && (error.code === '23505' || error.message?.toLowerCase().includes('unique') || error.message?.toLowerCase().includes('duplicate'))) {
              // Code collision from concurrent insertion; retry loop with next index
              continue;
            } else if (error) {
              console.warn('Supabase team_passports insert error, using local fallback:', error.message);
            }
          } catch (err: any) {
            console.warn('Supabase team_passports insert exception:', err?.message || err);
          }
        }

        // Fallback to local storage insertion
        const localData: TeamPassport[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Check for local code collision
        if (localData.some(p => p.passport_code === candidatePassport.passport_code)) {
          continue;
        }

        localData.unshift(candidatePassport);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        finalPassport = candidatePassport;
      }

      if (!finalPassport) {
        throw new Error('Could not generate a unique passport code. Please try again.');
      }

      return finalPassport;
    });
  },

  async updateTeamStamps(passportId: string, newStamps: Record<string, StampTier>): Promise<TeamPassport> {
    return passportUpdateMutex.runExclusive(passportId, async () => {
      this.initLocalStorage();
      
      // Fetch current passport state (from DB if available, else local storage) to perform atomic merge
      let currentPassport: TeamPassport | null = null;
      let dbRecord: TeamPassport | null = null;

      if (supabase && !this.isUsingMock) {
        try {
          const { data, error } = await supabase
            .from('team_passports')
            .select('*')
            .eq('id', passportId)
            .single();
          if (!error && data) {
            dbRecord = data as TeamPassport;
          }
        } catch (e) {
          console.warn('Could not fetch latest passport from Supabase prior to stamp update:', e);
        }
      }

      const localData: TeamPassport[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const localPassport = localData.find(p => p.id === passportId) || null;
      currentPassport = dbRecord || localPassport;

      if (!currentPassport) {
        throw new Error('Passport not found.');
      }

      // Merge new stamps onto existing stamps so concurrent task updates don't overwrite each other
      const mergedStamps: Record<string, StampTier> = {
        ...(currentPassport.stamps || {}),
        ...newStamps
      };

      const totalPoints = calculatePassportPoints(mergedStamps);
      const updatedAt = new Date().toISOString();

      // Synchronize in local storage cache
      const targetIdx = localData.findIndex(p => p.id === passportId);
      if (targetIdx !== -1) {
        localData[targetIdx] = {
          ...localData[targetIdx],
          stamps: mergedStamps,
          total_points: totalPoints,
          updated_at: updatedAt
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
      }

      // Synchronize in Supabase
      if (supabase && !this.isUsingMock) {
        try {
          const { data, error } = await supabase
            .from('team_passports')
            .update({
              stamps: mergedStamps,
              total_points: totalPoints,
              updated_at: updatedAt
            })
            .eq('id', passportId)
            .select()
            .single();

          if (!error && data) {
            const synced = { ...data, total_points: calculatePassportPoints(data.stamps) };
            if (targetIdx !== -1) {
              localData[targetIdx] = synced;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
            }
            return synced;
          }
        } catch (err) {
          console.warn('Supabase stamp update fallback to local storage:', err);
        }
      }

      if (targetIdx !== -1) {
        return localData[targetIdx];
      }

      throw new Error('Failed to persist stamp update.');
    });
  },

  async deleteTeamPassport(passportId: string): Promise<void> {
    return passportUpdateMutex.runExclusive(passportId, async () => {
      this.initLocalStorage();
      const localData: TeamPassport[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = localData.filter(p => p.id !== passportId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      if (supabase && !this.isUsingMock) {
        try {
          await supabase.from('team_passports').delete().eq('id', passportId);
        } catch (err) {
          console.warn('Supabase delete team passport error:', err);
        }
      }
    });
  }
};
