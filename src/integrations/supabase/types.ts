export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      meals: {
        Row: {
          calories: number | null
          created_at: string | null
          food_items: string
          id: string
          meal_date: string
          meal_type: string | null
          notes: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          food_items: string
          id?: string
          meal_date?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          food_items?: string
          id?: string
          meal_date?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          abdomen: number | null
          arm: number | null
          created_at: string | null
          hip: number | null
          id: string
          measurement_date: string
          notes: string | null
          photo_url: string | null
          thigh: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          abdomen?: number | null
          arm?: number | null
          created_at?: string | null
          hip?: number | null
          id?: string
          measurement_date?: string
          notes?: string | null
          photo_url?: string | null
          thigh?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          abdomen?: number | null
          arm?: number | null
          created_at?: string | null
          hip?: number | null
          id?: string
          measurement_date?: string
          notes?: string | null
          photo_url?: string | null
          thigh?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          application_date: string
          application_site: string | null
          created_at: string | null
          dose: number
          dose_unit: string | null
          id: string
          medication_name: string
          notes: string | null
          side_effects: string | null
          user_id: string
        }
        Insert: {
          application_date?: string
          application_site?: string | null
          created_at?: string | null
          dose: number
          dose_unit?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          side_effects?: string | null
          user_id: string
        }
        Update: {
          application_date?: string
          application_site?: string | null
          created_at?: string | null
          dose?: number
          dose_unit?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          side_effects?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          created_at: string | null
          energy_level: number | null
          id: string
          log_date: string
          mood_score: number | null
          motivation_level: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          log_date?: string
          mood_score?: number | null
          motivation_level?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          log_date?: string
          mood_score?: number | null
          motivation_level?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: number | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          current_weight: number | null
          dietary_restrictions: string | null
          full_name: string
          goal_weight: number | null
          height: number | null
          id: string
          initial_weight: number | null
          treatment_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          activity_level?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          current_weight?: number | null
          dietary_restrictions?: string | null
          full_name: string
          goal_weight?: number | null
          height?: number | null
          id: string
          initial_weight?: number | null
          treatment_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_level?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          current_weight?: number | null
          dietary_restrictions?: string | null
          full_name?: string
          goal_weight?: number | null
          height?: number | null
          id?: string
          initial_weight?: number | null
          treatment_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string | null
          duration_minutes: number
          fasting_cardio: boolean | null
          id: string
          intensity: string | null
          notes: string | null
          user_id: string
          workout_date: string
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          fasting_cardio?: boolean | null
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id: string
          workout_date?: string
          workout_type: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          fasting_cardio?: boolean | null
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id?: string
          workout_date?: string
          workout_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
