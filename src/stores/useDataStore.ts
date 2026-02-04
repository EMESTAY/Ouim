import { create } from 'zustand';
import type { BackupData } from '../types';
import { BackupDataSchema } from '../types/schemas';

interface DataStore {
  data: BackupData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setData: (data: BackupData) => void;
  importData: (jsonString: string) => Promise<boolean>;
  reset: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setData: (data) => set({ data, error: null }),

  importData: async (jsonString: string) => {
    set({ isLoading: true, error: null });
    try {
      const parsed = JSON.parse(jsonString);
      // Validate with Zod
      const result = BackupDataSchema.safeParse(parsed);

      if (!result.success) {
        throw new Error('Invalid data format: ' + result.error.message);
      }

      set({ data: result.data, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  reset: () => set({ data: null, error: null }),
}));
