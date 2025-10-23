export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          current_weight: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          current_weight?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          current_weight?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          category: ExerciseCategory
          is_custom: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: ExerciseCategory
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: ExerciseCategory
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          body_weight: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_date?: string
          body_weight?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          body_weight?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: number
          weight: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: number
          weight: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          sets?: number
          reps?: number
          weight?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types for working with the database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row']

// Types with relations
export type WorkoutWithExercises = Workout & {
  workout_exercises: (WorkoutExercise & {
    exercise: Exercise
  })[]
}

export type ExerciseProgress = {
  exercise: Exercise
  history: {
    date: string
    weight: number
    sets: number
    reps: number
    volume: number
  }[]
  personalRecord: {
    weight: number
    date: string
  }
}
