import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Team, PaymentStatus } from './types.ts';
import { z } from 'zod';
import { getEnv } from './env.ts';

const STORAGE_KEY = 'neuron_teams_vault';

const teamValidator = z.object({
  id: z.string(),
  teamname: z.string().min(3).max(20),
  teamid: z.string().startsWith('TALOS-'),
  leademail: z.string().email(),
  paymentstatus: z.nativeEnum(PaymentStatus),
  checkedin: z.boolean(),
  registeredat: z.number(),
  members: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().length(10),
    role: z.string()
  })).min(2).max(4)
});

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
const TABLE_NAME = 'teams';

export const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const generateSecureID = (prefix = '', length = 6) => {
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
      console.error("Validation Error:", validation.error);
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('neuron_draft_v3');
    sessionStorage.removeItem('neuron_draft_v4');
    
    if (!supabase) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw new Error(`Purge Failure: ${error.message}`);
  },

  async findTeamByName(name: string): Promise<Team | null> {
    if (!supabase) {
      const teams = await this.getTeams();
      return teams.find(t => t.teamname.toLowerCase() === name.toLowerCase()) || null;
    }

    const { data } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('teamname', name)
      .maybeSingle();

    return (data as Team) || null;
  },

  async findTeamByTALOSID(talosID: string): Promise<Team | null> {
    if (!supabase) {
      const teams = await this.getTeams();
      return teams.find(t => t.teamid.toUpperCase() === talosID.toUpperCase()) || null;
    }

    const { data } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('teamid', talosID.toUpperCase())
      .maybeSingle();

    return (data as Team) || null;
  },

  async updateCheckIn(id: string, status: boolean): Promise<void> {
    const teams = await this.getTeams();
    const team = teams.find(t => t.id === id);
    if (team) {
      team.checkedin = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    }

    if (!supabase) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ checkedin: status })
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
    const paid = teams.filter(t => t.paymentstatus === PaymentStatus.PAID);
    return {
      totalTeams: teams.length,
      paidTeams: paid.length,
      checkedIn: teams.filter(t => t.checkedin).length,
      revenue: paid.length * 1
    };
  }
};