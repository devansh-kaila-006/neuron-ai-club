
import { createClient } from '@supabase/supabase-js';
import { Team, PaymentStatus } from './types.ts';
import { z } from 'zod';

const STORAGE_KEY = 'neuron_teams_vault';

const teamValidator = z.object({
  id: z.string(),
  teamName: z.string().min(3).max(20),
  teamID: z.string().startsWith('TALOS-'),
  leadEmail: z.string().email(),
  paymentStatus: z.nativeEnum(PaymentStatus),
  checkedIn: z.boolean(),
  registeredAt: z.number(),
  members: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().length(10),
    role: z.string()
  })).min(2).max(4)
});

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) return (window as any).process.env[key];
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
      if (metaEnv[key]) return metaEnv[key];
    }
    if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
    return undefined;
  } catch { return undefined; }
};

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
const TABLE_NAME = 'teams';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const generateSecureID = (prefix = '', length = 8) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomStr = array[0].toString(36).substring(0, length).toUpperCase();
  return prefix ? `${prefix}-${randomStr}` : randomStr;
};

export const storage = {
  async getTeams(): Promise<Team[]> {
    if (!supabase) {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    }

    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data as Team[];
    }
    
    return [];
  },

  async saveTeam(team: Team): Promise<void> {
    const validation = teamValidator.safeParse(team);
    if (!validation.success) {
      throw new Error("Neural Corrupt: Manifest failed integrity check.");
    }

    const teams = await this.getTeams();
    const index = teams.findIndex(t => t.id === team.id);
    if (index >= 0) teams[index] = team;
    else teams.push(team);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));

    if (!supabase) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(team, { onConflict: 'id' });

    if (error) throw new Error("Neural Link Failure: Cloud sync failed.");
  },

  async clearAllData(): Promise<void> {
    // 1. Clear Local Cache and Manifest Drafts
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('neuron_draft_v3');
    sessionStorage.removeItem('neuron_draft_v4');
    
    if (!supabase) return;

    // 2. Clear Cloud (Delete all rows from table)
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw new Error(`Purge Failure: ${error.message}`);
  },

  async findTeamByName(name: string): Promise<Team | null> {
    if (!supabase) {
      const teams = await this.getTeams();
      return teams.find(t => t.teamName.toLowerCase() === name.toLowerCase()) || null;
    }

    const { data } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('teamName', name)
      .maybeSingle();

    return (data as Team) || null;
  },

  async findTeamByTALOSID(talosID: string): Promise<Team | null> {
    if (!supabase) {
      const teams = await this.getTeams();
      return teams.find(t => t.teamID.toUpperCase() === talosID.toUpperCase()) || null;
    }

    const { data } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('teamID', talosID.toUpperCase())
      .maybeSingle();

    return (data as Team) || null;
  },

  async updateCheckIn(id: string, status: boolean): Promise<void> {
    const teams = await this.getTeams();
    const team = teams.find(t => t.id === id);
    if (team) {
      team.checkedIn = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    }

    if (!supabase) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ checkedIn: status })
      .eq('id', id);

    if (error) throw new Error("Neural Link Failure: Status update failed.");
  },

  async deleteTeam(id: string): Promise<void> {
    const teams = await this.getTeams();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams.filter(t => t.id !== id)));

    if (!supabase) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw new Error("Neural Link Failure: Deletion failed.");
  },

  async getStats() {
    const teams = await this.getTeams();
    const paid = teams.filter(t => t.paymentStatus === PaymentStatus.PAID);
    return {
      totalTeams: teams.length,
      paidTeams: paid.length,
      checkedIn: teams.filter(t => t.checkedIn).length,
      revenue: paid.length * 499
    };
  }
};
