
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
    return (window as any).process?.env?.[key] || (globalThis as any).process?.env?.[key];
  } catch {
    return undefined;
  }
};

const APP_ID = getEnv("MONGODB_APP_ID");
const API_KEY = getEnv("MONGODB_API_KEY");
const CLUSTER = getEnv("MONGODB_CLUSTER") || "Cluster0";
const DATABASE = getEnv("MONGODB_DATABASE") || "neuron_db";
const REGION = getEnv("MONGODB_REGION") || "us-east-1";
const COLLECTION = 'teams';

const BASE_URL = `https://${REGION}.aws.data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1/action`;

export const generateSecureID = (prefix = '', length = 8) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomStr = array[0].toString(36).substring(0, length).toUpperCase();
  return prefix ? `${prefix}-${randomStr}` : randomStr;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

async function atlasFetch(action: string, body: any) {
  if (!APP_ID || !API_KEY) {
    console.warn("[Storage] Atlas Credentials missing. Operating in Local-Only mode.");
    return null;
  }
  
  return withRetry(async () => {
    const response = await fetch(`${BASE_URL}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': API_KEY },
      body: JSON.stringify({
        dataSource: CLUSTER,
        database: DATABASE,
        collection: body.collection || COLLECTION,
        ...body,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Atlas API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  }).catch(err => {
    console.error("[Persistence Layer] Uplink failure:", err.message);
    return null;
  });
}

export const storage = {
  async getTeams(): Promise<Team[]> {
    const remoteData = await atlasFetch('find', { filter: {} });
    if (remoteData?.documents) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData.documents));
      return remoteData.documents;
    }
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  async saveTeam(team: Team): Promise<void> {
    const validation = teamValidator.safeParse(team);
    if (!validation.success) {
      console.error("[Integrity Error]", validation.error);
      throw new Error("Neural Corrupt: Manifest failed integrity check.");
    }

    const teams = await this.getTeams();
    const index = teams.findIndex(t => t.id === team.id);
    if (index >= 0) teams[index] = team;
    else teams.push(team);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    await atlasFetch('updateOne', { 
      filter: { id: team.id }, 
      update: { $set: team },
      upsert: true 
    });
  },

  async findTeamByName(name: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamName.toLowerCase() === name.toLowerCase()) || null;
  },

  async findTeamByTALOSID(talosID: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamID.toUpperCase() === talosID.toUpperCase()) || null;
  },

  async updateCheckIn(id: string, status: boolean): Promise<void> {
    const teams = await this.getTeams();
    const team = teams.find(t => t.id === id);
    if (team) {
      team.checkedIn = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
      await atlasFetch('updateOne', { filter: { id }, update: { $set: { checkedIn: status } } });
    }
  },

  async deleteTeam(id: string): Promise<void> {
    const teams = await this.getTeams();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams.filter(t => t.id !== id)));
    await atlasFetch('deleteOne', { filter: { id } });
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
