import { create } from 'zustand';
import axios from 'axios';

export interface Pigeon {
  id: number;
  name: string;
  spriteKey: string;
  level: number;
  mood: string;
  energy: number;
  trait: string;
}

interface PigeonState {
  party: Pigeon[];
  activePigeon: Pigeon | null;

  fetchParty: () => Promise<void>;
  setActivePigeon: (pigeonId: number) => Promise<void>;
}

export const usePigeonStore = create<PigeonState>((set) => ({
  party: [],
  activePigeon: null,

  fetchParty: async () => {
    const response = await axios.get('/api/pigeons/party');
    const party = response.data;
    set({ party, activePigeon: party[0] || null });
  },

  setActivePigeon: async (pigeonId) => {
    await axios.put(`/api/pigeons/${pigeonId}/activate`);
    set(state => ({
      activePigeon: state.party.find(p => p.id === pigeonId) || null
    }));
  },
}));
