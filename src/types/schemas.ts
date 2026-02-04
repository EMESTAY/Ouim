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

export const BodyMeasurementSchema = z.preprocess(
  (val: unknown) => {
    if (typeof val === 'object' && val !== null) {
      const v = val as Record<string, unknown>;
      return {
        ...v,
        bodyFat: v.bodyFat ?? v.body_fat,
        muscleMass: v.muscleMass ?? v.muscle_mass,
        waterPercentage: v.waterPercentage ?? v.water_percentage,
        visceralFat: v.visceralFat ?? v.visceral_fat,
        boneMass: v.boneMass ?? v.bone_mass,
        metabolicAge: v.metabolicAge ?? v.metabolic_age,
        proteinPercentage: v.proteinPercentage ?? v.protein_percentage,
      };
    }
    return val;
  },
  z.object({
    id: z.coerce.string(),
    date: z.number(),
    weight: z.number(), // kg
    height: z.number().nullable().optional(), // Cm (sometimes logged)
    bodyFat: z.number().nullable().optional(), // %
    muscleMass: z.number().nullable().optional(), // kg or % based on user pref, usually kg from scale
    waterPercentage: z.number().nullable().optional(), // %
    visceralFat: z.number().nullable().optional(), // Rating
    boneMass: z.number().nullable().optional(), // kg
    bmr: z.number().nullable().optional(), // kcal
    metabolicAge: z.number().nullable().optional(), // years
    proteinPercentage: z.number().nullable().optional(), // %
  })
);

// ============================================
// EXERCISE SCHEMA (for raw DB export)
// ============================================

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscle_group: MuscleGroupSchema.optional().nullable(),
  equipment: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.number().optional().nullable(),
});

// ============================================
// SET SCHEMA (for raw DB export)
// ============================================

export const WorkoutSetSchema = z.object({
  id: z.string(),
  workout_id: z.string(),
  exercise_id: z.string(),
  set_number: z.number(),
  reps: z.number(),
  weight: z.number(),
  is_warmup: z.union([z.boolean(), z.number()]).optional().nullable(),
  rpe: z.number().optional().nullable(),
  timestamp: z.number().optional().nullable(),
});

// ============================================
// BACKUP SCHEMA
// ============================================

export const BackupDataSchema = z.preprocess(
  (val: unknown) => {
    if (typeof val === 'object' && val !== null) {
      const v = val as Record<string, unknown>;
      // Normalize field names
      const normalized: Record<string, unknown> = {
        ...v,
        exportDate: v.exportDate ?? v.date,
        workoutHistory: v.workoutHistory ?? v.workouts ?? [],
        exercises: v.exercises ?? [],
        sets: v.sets ?? [],
      };

      // Parse sessions from raw DB format if needed
      if (Array.isArray(normalized.sessions)) {
        const parsedSessions: Record<string, unknown> = {};
        for (const sess of normalized.sessions) {
          // Raw DB format has 'data' as JSON string
          if (typeof sess.data === 'string') {
            try {
              const parsed = JSON.parse(sess.data);
              parsedSessions[parsed.id || sess.id] = parsed;
            } catch {
              // If parsing fails, skip
            }
          } else if (sess.id && sess.name && sess.sections) {
            // Already parsed format
            parsedSessions[sess.id] = sess;
          }
        }
        normalized.sessions = parsedSessions;
      }

      return normalized;
    }
    return val;
  },
  z.object({
    version: z.coerce.string(),
    exportDate: z.number().optional(),
    exercises: z.array(ExerciseSchema).optional().default([]),
    sessions: z
      .union([
        z.record(SessionIdSchema, SessionRoutineSchema),
        z
          .array(SessionRoutineSchema)
          .transform((arr) =>
            arr.reduce((acc, session) => ({ ...acc, [session.id]: session }), {})
          ),
        z.array(z.unknown()).transform(() => ({})), // Handle empty generic arrays
      ])
      .optional()
      .default({}),
    workoutHistory: z.array(WorkoutLogSchema).optional().default([]),
    sets: z.array(WorkoutSetSchema).optional().default([]),
    userProfile: UserProfileSchema.optional(),
    bodyMeasurements: z.array(BodyMeasurementSchema).optional(),
  })
);

// ============================================
// PROGRAM EXPORT SCHEMA
// ============================================

export const ProgramExportSchema = z.object({
  version: z.coerce.string(),
  exportDate: z.number().optional(),
  type: z.literal('program_export'),
  sessions: z.union([
    z.record(SessionIdSchema, SessionRoutineSchema),
    z
      .array(SessionRoutineSchema)
      .transform((arr) => arr.reduce((acc, session) => ({ ...acc, [session.id]: session }), {})),
  ]),
});

export const SessionExportSchema = z.object({
  version: z.coerce.string(),
  exportDate: z.number().optional(),
  type: z.literal('session_export'),
  sourceId: SessionIdSchema.optional(),
  session: SessionRoutineSchema,
});
