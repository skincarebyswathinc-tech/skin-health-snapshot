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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_preferences: {
        Row: {
          created_at: string
          id: string
          onboarding_complete: boolean | null
          reminder_pref: string | null
          theme_pref: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_complete?: boolean | null
          reminder_pref?: string | null
          theme_pref?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_complete?: boolean | null
          reminder_pref?: string | null
          theme_pref?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lifestyle_logs: {
        Row: {
          created_at: string
          dairy_intake_level: string | null
          date: string
          diet_quality: number | null
          exercise_minutes: number | null
          id: string
          notes: string | null
          sleep_hours: number | null
          stress_level: number | null
          sugar_intake_level: string | null
          updated_at: string
          user_id: string
          water_intake_liters: number | null
        }
        Insert: {
          created_at?: string
          dairy_intake_level?: string | null
          date?: string
          diet_quality?: number | null
          exercise_minutes?: number | null
          id?: string
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          sugar_intake_level?: string | null
          updated_at?: string
          user_id: string
          water_intake_liters?: number | null
        }
        Update: {
          created_at?: string
          dairy_intake_level?: string | null
          date?: string
          diet_quality?: number | null
          exercise_minutes?: number | null
          id?: string
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          sugar_intake_level?: string | null
          updated_at?: string
          user_id?: string
          water_intake_liters?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          consent_accepted: boolean | null
          created_at: string
          first_name: string | null
          goals: string[] | null
          id: string
          skin_concerns: string[] | null
          skin_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          consent_accepted?: boolean | null
          created_at?: string
          first_name?: string | null
          goals?: string[] | null
          id?: string
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          consent_accepted?: boolean | null
          created_at?: string
          first_name?: string | null
          goals?: string[] | null
          id?: string
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string
          reward_granted: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id: string
          reward_granted?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_granted?: boolean
        }
        Relationships: []
      }
      scan_usage: {
        Row: {
          bonus_scans: number
          created_at: string
          id: string
          month: number
          scan_count: number
          user_id: string
          year: number
        }
        Insert: {
          bonus_scans?: number
          created_at?: string
          id?: string
          month: number
          scan_count?: number
          user_id: string
          year: number
        }
        Update: {
          bonus_scans?: number
          created_at?: string
          id?: string
          month?: number
          scan_count?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string
          elasticity_score: number | null
          hydration_score: number | null
          id: string
          image_url: string | null
          inflammation_score: number | null
          overall_score: number | null
          pigmentation_score: number | null
          skin_age_estimate: number | null
          status: string
          summary_text: string | null
          texture_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          elasticity_score?: number | null
          hydration_score?: number | null
          id?: string
          image_url?: string | null
          inflammation_score?: number | null
          overall_score?: number | null
          pigmentation_score?: number | null
          skin_age_estimate?: number | null
          status?: string
          summary_text?: string | null
          texture_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          elasticity_score?: number | null
          hydration_score?: number | null
          id?: string
          image_url?: string | null
          inflammation_score?: number | null
          overall_score?: number | null
          pigmentation_score?: number | null
          skin_age_estimate?: number | null
          status?: string
          summary_text?: string | null
          texture_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      skin_progress_metrics: {
        Row: {
          created_at: string
          date: string
          elasticity_score: number | null
          hydration_score: number | null
          id: string
          inflammation_score: number | null
          pigmentation_score: number | null
          scan_id: string | null
          skin_score: number | null
          texture_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          elasticity_score?: number | null
          hydration_score?: number | null
          id?: string
          inflammation_score?: number | null
          pigmentation_score?: number | null
          scan_id?: string | null
          skin_score?: number | null
          texture_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          elasticity_score?: number | null
          hydration_score?: number | null
          id?: string
          inflammation_score?: number | null
          pigmentation_score?: number | null
          scan_id?: string | null
          skin_score?: number | null
          texture_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skin_progress_metrics_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_type: string
          renewal_date: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_type?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_type?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
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
