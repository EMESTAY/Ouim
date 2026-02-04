import { z } from 'zod';
import * as S from './schemas';

// ============================================
// SCHEMA EXPORTS
// ============================================
export * from './schemas';

// ============================================
// TYPE EXPORTS (inferred from Zod)
// ============================================

export type Set = z.infer<typeof S.SetSchema>;
export type MuscleGroup = z.infer<typeof S.MuscleGroupSchema>;
export type Machine = z.infer<typeof S.MachineSchema>;
export type Section = z.infer<typeof S.SectionSchema>;
export type SessionRoutine = z.infer<typeof S.SessionRoutineSchema>;
export type SessionId = z.infer<typeof S.SessionIdSchema>;
export type ExerciseLog = z.infer<typeof S.ExerciseLogSchema>;
export type WorkoutLog = z.infer<typeof S.WorkoutLogSchema>;
export type BackupData = z.infer<typeof S.BackupDataSchema>;
export type ProgramExportData = z.infer<typeof S.ProgramExportSchema>;
export type SessionExportData = z.infer<typeof S.SessionExportSchema>;
export type UserProfile = z.infer<typeof S.UserProfileSchema>;
export type BodyMeasurement = z.infer<typeof S.BodyMeasurementSchema>;
export type Exercise = z.infer<typeof S.ExerciseSchema>;
export type WorkoutSet = z.infer<typeof S.WorkoutSetSchema>;

// ============================================
// UTILITIES
// ============================================

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error; code?: string; message: string };
