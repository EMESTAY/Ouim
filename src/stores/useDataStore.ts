import { create } from 'zustand';
import type { BackupData } from '../types';
import { BackupDataSchema } from '../types/schemas';
import { ZodError } from 'zod';

interface DataStore {
  data: BackupData | null;
  isLoading: boolean;
  error: string | null;

  // actions
  setData: (data: BackupData) => void;
  updateData: (updates: Partial<BackupData>) => void;
  importData: (jsonString: string) => Promise<boolean>;
  exportData: () => void;
  reset: () => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  setData: (data) => set({ data, error: null }),

  updateData: (updates) => {
    const currentData = get().data;
    if (currentData) {
      set({ data: { ...currentData, ...updates } });
    }
  },

  importData: async (jsonString: string) => {
    set({ isLoading: true, error: null });
    console.log('Starting data import...');

    try {
      if (!jsonString || jsonString.trim() === '') {
        throw new Error('Le fichier est vide.');
      }

      console.log('Parsing JSON...');
      const parsed = JSON.parse(jsonString);
      console.log('JSON parsed successfully:', {
        hasVersion: !!parsed.version,
        sessionsCount: Array.isArray(parsed.sessions)
          ? parsed.sessions.length
          : Object.keys(parsed.sessions || {}).length,
        hasHistory: !!parsed.workoutHistory,
      });

      // validation zod
      console.log('Validating with Zod schema...');
      const result = BackupDataSchema.safeParse(parsed);

      if (!result.success) {
        console.error('Zod Validation Error:', result.error.format());
        const firstError = (result.error as ZodError).errors[0];
        const path = firstError.path.join('.');
        throw new Error(`Erreur de format (${path}): ${firstError.message}`);
      }

      console.log('Validation successful! Updating store...');
      set({ data: result.data, isLoading: false });
      return true;
    } catch (e: unknown) {
      console.error('Import failed:', e);
      const message = e instanceof Error ? e.message : 'Unknown error during import';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  exportData: () => {
    const data = get().data;
    if (!data) return;

    // preparation export
    const exportPayload = {
      version: data.version,
      date: Date.now(),
      exercises: data.exercises || [],
      sessions: Object.values(data.sessions).map((session) => ({
        id: session.id,
        name: session.name,
        data: JSON.stringify(session), // format db
      })),
      workouts: data.workoutHistory,
      sets: data.sets || [],
      bodyMeasurements: data.bodyMeasurements || [],
      userProfile: data.userProfile,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // nom fichier
    const date = new Date().toISOString().split('T')[0];
    const filename = `gym-tracker-fusion-${date}.json`;

    // telechargement
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  reset: () => set({ data: null, error: null }),
}));
