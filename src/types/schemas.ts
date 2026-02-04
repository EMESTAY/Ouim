import { z } from 'zod';

// ============================================
// BASE SCHEMAS
// ============================================

export const SetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  timestamp: z.number().optional(),
  isWarmup: z.boolean().optional(),
  rpe: z.number().min(1).max(10).optional(), // Rate of Perceived Exertion (for auto-regulation)
});

export const MuscleGroupSchema = z.enum([
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
  'glutes',
]);

export const MachineSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().optional(),
  name: z.string().min(1),
  targetSets: z.number().int().positive(),
  targetReps: z.number().int().positive(),
  targetWeight: z.number().nonnegative(),
  restTime: z.number().nonnegative(),
  completedSets: z.array(SetSchema),
  notes: z.string().optional(),
  duration: z.string().optional(),
  machineRef: z.string().optional(),
  muscleGroup: MuscleGroupSchema.optional(),
  muscleGroups: z.array(MuscleGroupSchema).optional(),
  isSkipped: z.boolean().optional(),
});

export const SectionTypeSchema = z.enum(['warmup', 'training', 'cardio']);

export const SectionSchema = z.object({
  title: z.string().min(1),
  type: SectionTypeSchema,
  machines: z.array(MachineSchema),
});

export const SessionRoutineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string(),
  sections: z.array(SectionSchema),
});

export const SessionIdSchema = z.string();

// ============================================
// HISTORY SCHEMAS
// ============================================

export const ExerciseLogSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  machineRef: z.string().optional(),
  sets: z.array(SetSchema),
});

export const WorkoutLogSchema = z.object({
  id: z.string().min(1),
  date: z.number(),
  sessionId: SessionIdSchema,
  exercises: z.array(ExerciseLogSchema),
});

// ============================================
// USER SCHEMAS
// ============================================

export const UserProfileSchema = z.object({
  weight: z.number().optional(),
  height: z.number().optional(),
  bodyFat: z.number().optional(),
  sex: z.enum(['male', 'female']).optional(), // For DOTS score calculation
  muscleMass: z.number().optional(),
  waterPercentage: z.number().optional(),
  visceralFat: z.number().optional(),
  boneMass: z.number().optional(),
  bmr: z.number().optional(),
  metabolicAge: z.number().optional(),
  preferences: z
    .object({
      activeWidgets: z.array(z.string()).optional(), // New: Widget preferences
      radarMuscles: z.array(MuscleGroupSchema).optional(), // Config: Radar Chart Muscles
      // Algorithm & Science
      oneRMFormula: z.enum(['epley', 'brzycki', 'lombardi']).optional(),
      units: z.enum(['kg', 'lbs']).optional(),

      // Equipment Configuration
      barWeight: z.number().optional(), // kg
      availablePlates: z.array(z.number()).optional(), // kg
      minIncrement: z.number().optional(), // kg

      // UX Preferences
      keepScreenAwake: z.boolean().optional(),
      inputMode: z.enum(['keyboard', 'buttons']).optional(),

      // Timer Settings
      timer: z
        .object({
          sound: z.boolean().optional(),
          haptics: z.boolean().optional(),
          audioDucking: z.boolean().optional(),
          displayMode: z.enum(['fullscreen', 'bar', 'notification']).optional(),
        })
        .optional(),

      // Theme & Display
      themeMode: z.enum(['system', 'light', 'dark', 'oled']).optional(),
      fontScale: z.number().min(0.8).max(1.2).optional(),

      // Notifications & Habits
      workoutReminders: z.boolean().optional(),
      reminderFrequency: z.number().optional(), // days
      acwrAlerts: z.boolean().optional(),
    })
    .optional(),
});

export const BodyMeasurementSchema = z.object({
  id: z.string(),
  date: z.number(),
  weight: z.number(), // kg
  height: z.number().optional(), // Cm (sometimes logged)
  bodyFat: z.number().optional(), // %
  muscleMass: z.number().optional(), // kg or % based on user pref, usually kg from scale
  waterPercentage: z.number().optional(), // %
  visceralFat: z.number().optional(), // Rating
  boneMass: z.number().optional(), // kg
  bmr: z.number().optional(), // kcal
  metabolicAge: z.number().optional(), // years
  proteinPercentage: z.number().optional(), // %
});

// ============================================
// BACKUP SCHEMA
// ============================================

export const BackupDataSchema = z.object({
  version: z.string(),
  exportDate: z.number(),
  sessions: z.record(SessionIdSchema, SessionRoutineSchema),
  workoutHistory: z.array(WorkoutLogSchema),
  userProfile: UserProfileSchema.optional(),
  bodyMeasurements: z.array(BodyMeasurementSchema).optional(),
});

// ============================================
// PROGRAM EXPORT SCHEMA
// ============================================

export const ProgramExportSchema = z.object({
  version: z.string(),
  exportDate: z.number(),
  type: z.literal('program_export'),
  sessions: z.record(SessionIdSchema, SessionRoutineSchema),
});

export const SessionExportSchema = z.object({
  version: z.string(),
  exportDate: z.number(),
  type: z.literal('session_export'),
  sourceId: SessionIdSchema.optional(),
  session: SessionRoutineSchema,
});
