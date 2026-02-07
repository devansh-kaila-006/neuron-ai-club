
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Team, PaymentStatus } from './types.ts';
import { z } from 'zod';
import { getEnv } from './env.ts';
import { authService } from '../services/auth.ts';

const STORAGE_KEY = 'neuron_teams_vault_session';

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
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { 'x-neuron-client': 'shield-v1' }
      }
    })
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
      const cached = sessionStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('registeredat', { ascending: false });

    if (error) {
      console.error("Read Error:", error);
      const cached = sessionStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    }

    if (data) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(teams));

    if (!supabase) return;

    // Use Edge Function proxy to handle Admin bypass of RLS
    const sessionHash = authService.getStoredHash();
    const { error } = await supabase.functions.invoke('admin-action', {
      body: { action: 'SAVE_TEAM', payload: team },
      headers: { 'x-neural-auth': sessionHash || '' }
    });

    if (error) throw new Error("Cloud Sync Failure: Save operation rejected.");
  },

  async updateCheckIn(id: string, status: boolean): Promise<void> {
    const teams = await this.getTeams();
    const team = teams.find(t => t.id === id);
    if (team) {
      team.checkedin = status;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    }

    if (!supabase) return;

    // Use Edge Function proxy to handle Admin bypass of RLS
    const sessionHash = authService.getStoredHash();
    const { error } = await supabase.functions.invoke('admin-action', {
      body: { action: 'UPDATE_CHECKIN', payload: { id, status } },
      headers: { 'x-neural-auth': sessionHash || '' }
    });

    if (error) throw new Error("Cloud Sync Failure: Check-in rejected.");
  },

  async deleteTeam(id: string): Promise<void> {
    const teams = await this.getTeams();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(teams.filter(t => t.id !== id)));

    if (!supabase) return;

    const sessionHash = authService.getStoredHash();
    const { error } = await supabase.functions.invoke('admin-action', {
      body: { action: 'DELETE_TEAM', payload: { id } },
      headers: { 'x-neural-auth': sessionHash || '' }
    });

    if (error) throw new Error("Cloud Sync Failure: Deletion rejected.");
  },

  async clearAllData(): Promise<void> {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('neuron_draft_v4');
    
    // Purge logic usually restricted to direct DB if permitted or separate edge action
    if (!supabase) return;
    // For safety, clearAllData in cloud is not implemented via generic admin-action to prevent accidents.
  },

  async findTeamByName(name: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamname.toLowerCase() === name.toLowerCase()) || null;
  },

  async findTeamByTALOSID(talosID: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamid.toUpperCase() === talosID.toUpperCase()) || null;
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
