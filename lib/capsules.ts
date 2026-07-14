import { supabase } from './storage.ts';
import { Capsule, CapsuleStatus } from './types.ts';

const STORAGE_KEY = 'neuron_capsules_vault_v1';

// Initial pre-populated mock capsules for seamless testing and demonstration
const DEFAULT_MOCK_CAPSULES: Capsule[] = [
  {
    id: 'mock-1',
    capsule_code: 'NRNCAP-2026-0001',
    enrollment_no: 'AM.EN.U4CSE23001',
    full_name: 'Aditya Verma',
    branch: 'Computer Science & Engineering',
    email: 'aditya.v@amrita.edu',
    q1_answer: 'I want to be a Lead AI Architect at DeepMind or building my own open-source AI collective. I hope to design cognitive systems that solve climate forecasting and deep-space trajectory calculations.',
    q2_answer: 'In 2030, human-to-AI neural implants will be in clinical trials, and LLMs will be replaced by fully-reasoning action agents that can write whole software ecosystems from scratch in seconds.',
    q3_answer: 'Remember those nights when you survived on nothing but Amritapuri canteen tea and instant noodles while compiling the TALOS core engine? Stay humble, keep your curiosity, and do not lose touch with your friends.',
    status: CapsuleStatus.SUBMITTED,
    cohort_year: 2026,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 'mock-2',
    capsule_code: 'NRNCAP-2026-0002',
    enrollment_no: 'AM.EN.U4ECE23145',
    full_name: 'Meera Nair',
    branch: 'Electronics & Communication Engineering',
    email: 'meera.n@amrita.edu',
    q1_answer: 'I hope to be designing neuromorphic computer chips that mimic the biological density of human brains. I want to build physical, sentient devices rather than just running code in the cloud.',
    q2_answer: 'By 2030, silicon chips will be reaching their physical limits, and we will see organic biological computing and optical light-based logic gates deployed in commercial supercomputers.',
    q3_answer: 'I hope you are still sketching circuit designs in your paper notebook instead of fully delegating your mind to spatial projections. Remember the sound of the Arabian Sea from the main building balcony.',
    status: CapsuleStatus.SUBMITTED,
    cohort_year: 2026,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: 'mock-3',
    capsule_code: 'NRNCAP-2026-0003',
    enrollment_no: 'AM.EN.U4ME23089',
    full_name: 'Rohan Das',
    branch: 'Mechanical Engineering',
    email: 'rohan.d@amrita.edu',
    q1_answer: 'I want to bridge the physical world and artificial intelligence. My dream is to design low-cost, smart cybernetic prosthetic limbs integrated with muscular sensory loops.',
    q2_answer: 'In 2030, robotic prostheses will achieve perfect 1:1 tactile feedback, allowing amputees to play instruments or write with delicate accuracy.',
    q3_answer: 'Rohan, do not stop playing the acoustic guitar. Also, did you finally get around to fixing the loose gear on the lab CNC machine, or is it still rattling? Stay focused and never compromise on making healthcare accessible.',
    status: CapsuleStatus.SEALED,
    cohort_year: 2026,
    date_sealed: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() // 1 day ago
  }
];

export const capsuleService = {
  // Flag to indicate if we are using the local mock storage
  isUsingMock: false,

  /**
   * Helper to initialize capsules in local storage if not present
   */
  initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_CAPSULES));
    }
  },

  /**
   * Fetch all capsules (ordered by date)
   */
  async getCapsules(cohortYear?: number): Promise<Capsule[]> {
    this.initLocalStorage();

    if (!supabase) {
      this.isUsingMock = true;
      const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (cohortYear) {
        return localData.filter((c: Capsule) => c.cohort_year === cohortYear);
      }
      return localData;
    }

    try {
      let query = supabase.from('capsules').select('*').order('created_at', { ascending: false });
      if (cohortYear) {
        query = query.eq('cohort_year', cohortYear);
      }
      
      const { data, error } = await query;
      
      if (error) {
        // Fallback to local storage if table doesn't exist
        console.warn('Supabase capsules table not accessible, falling back to local storage:', error.message);
        this.isUsingMock = true;
        const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (cohortYear) {
          return localData.filter((c: Capsule) => c.cohort_year === cohortYear);
        }
        return localData;
      }

      this.isUsingMock = false;
      return data as Capsule[];
    } catch (err) {
      console.error('Failed to fetch capsules from database, using mock:', err);
      this.isUsingMock = true;
      const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (cohortYear) {
        return localData.filter((c: Capsule) => c.cohort_year === cohortYear);
      }
      return localData;
    }
  },

  /**
   * Retrieve a single capsule by its unique capsule_code or ID
   */
  async findCapsule(codeOrId: string): Promise<Capsule | null> {
    this.initLocalStorage();
    const uppercaseCode = codeOrId.trim().toUpperCase();

    if (!supabase || this.isUsingMock) {
      const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return localData.find((c: Capsule) => 
        c.capsule_code.toUpperCase() === uppercaseCode || 
        c.id === codeOrId
      ) || null;
    }

    try {
      // Try searching by code first
      let { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('capsule_code', uppercaseCode)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Capsule;

      // Try searching by ID
      const { data: dataById, error: errorById } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', codeOrId)
        .maybeSingle();

      if (errorById) throw errorById;
      return (dataById as Capsule) || null;
    } catch (err) {
      console.warn('Supabase lookup error, searching local storage:', err);
      const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return localData.find((c: Capsule) => 
        c.capsule_code.toUpperCase() === uppercaseCode || 
        c.id === codeOrId
      ) || null;
    }
  },

  /**
   * Submit a new AI Time Capsule entry
   */
  async submitCapsule(entry: Omit<Capsule, 'id' | 'capsule_code' | 'status' | 'created_at'>): Promise<Capsule> {
    this.initLocalStorage();
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Calculate new index and generate capsule code
    const cohortYear = entry.cohort_year || new Date().getFullYear();
    const cohortCapsulesCount = localData.filter((c: Capsule) => c.cohort_year === cohortYear).length;
    const capsuleIndex = cohortCapsulesCount + 1;
    const capsuleCode = `NRNCAP-${cohortYear}-${String(capsuleIndex).padStart(4, '0')}`;
    
    const newCapsule: Capsule = {
      ...entry,
      id: `capsule-${Math.random().toString(36).substring(2, 11)}`,
      capsule_code: capsuleCode,
      status: CapsuleStatus.SUBMITTED,
      created_at: new Date().toISOString()
    };

    // Always update local storage as a cache/fallback
    localData.push(newCapsule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));

    if (!supabase || this.isUsingMock) {
      return newCapsule;
    }

    try {
      // Attempt db insertion without ID to let Postgres generate standard UUID
      const { id, ...dbPayload } = newCapsule;
      const { data, error } = await supabase
        .from('capsules')
        .insert([{
          ...dbPayload,
          capsule_code: capsuleCode // Let database generate id, but use calculated code
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database submission failure: ${error.message}`);
      }

      return data as Capsule;
    } catch (err: any) {
      console.warn('Supabase insert failed, using local storage cache:', err.message);
      // Mark as using mock for this session since database was write-blocked
      this.isUsingMock = true;
      return newCapsule;
    }
  },

  /**
   * Update status of a capsule (submitted -> generated -> reviewed -> sealed -> delivered)
   */
  async updateCapsuleStatus(id: string, status: CapsuleStatus, extra: Partial<Capsule> = {}): Promise<Capsule> {
    this.initLocalStorage();
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = localData.findIndex((c: Capsule) => c.id === id);
    
    if (index === -1) {
      throw new Error("Capsule sequence not found.");
    }

    const updated = {
      ...localData[index],
      status,
      ...extra
    };

    if (status === CapsuleStatus.SEALED && !updated.date_sealed) {
      updated.date_sealed = new Date().toISOString();
    }
    if (status === CapsuleStatus.DELIVERED && !updated.date_delivered) {
      updated.date_delivered = new Date().toISOString();
    }

    localData[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));

    if (!supabase || this.isUsingMock) {
      return updated;
    }

    try {
      const { error } = await supabase
        .from('capsules')
        .update({
          status,
          ...extra,
          date_sealed: updated.date_sealed || null,
          date_delivered: updated.date_delivered || null
        })
        .eq('id', id);

      if (error) throw error;
      return updated;
    } catch (err: any) {
      console.warn('Supabase status update failed, fallback saved to cache:', err.message);
      return updated;
    }
  },

  /**
   * Delete a capsule
   */
  async deleteCapsule(id: string): Promise<void> {
    this.initLocalStorage();
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = localData.filter((c: Capsule) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    if (!supabase || this.isUsingMock) return;

    try {
      const { error } = await supabase
        .from('capsules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Supabase deletion error:', err);
    }
  }
};
