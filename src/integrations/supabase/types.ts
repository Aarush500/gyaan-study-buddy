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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          day: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          chapter_name: string
          created_at: string | null
          id: string
          subject: string
          topic_key: string
          topic_title: string | null
          user_id: string
        }
        Insert: {
          chapter_name: string
          created_at?: string | null
          id?: string
          subject: string
          topic_key: string
          topic_title?: string | null
          user_id: string
        }
        Update: {
          chapter_name?: string
          created_at?: string | null
          id?: string
          subject?: string
          topic_key?: string
          topic_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chapter_notes_cache: {
        Row: {
          cache_key: string
          chapter_name: string
          class_level: string
          content: Json
          created_at: string | null
          id: string
          language: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          cache_key: string
          chapter_name: string
          class_level: string
          content: Json
          created_at?: string | null
          id?: string
          language: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          cache_key?: string
          chapter_name?: string
          class_level?: string
          content?: Json
          created_at?: string | null
          id?: string
          language?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          chapter_name: string
          created_at: string | null
          id: string
          reason: string
          status: string | null
          subject: string
          topic_key: string | null
          topic_title: string | null
          user_id: string
        }
        Insert: {
          chapter_name: string
          created_at?: string | null
          id?: string
          reason: string
          status?: string | null
          subject: string
          topic_key?: string | null
          topic_title?: string | null
          user_id: string
        }
        Update: {
          chapter_name?: string
          created_at?: string | null
          id?: string
          reason?: string
          status?: string | null
          subject?: string
          topic_key?: string | null
          topic_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      doubt_sessions: {
        Row: {
          chapter_name: string
          class_level: string
          created_at: string | null
          doubts_used: number | null
          id: string
          language: string | null
          max_doubts: number | null
          messages: Json | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_name: string
          class_level: string
          created_at?: string | null
          doubts_used?: number | null
          id?: string
          language?: string | null
          max_doubts?: number | null
          messages?: Json | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_name?: string
          class_level?: string
          created_at?: string | null
          doubts_used?: number | null
          id?: string
          language?: string | null
          max_doubts?: number | null
          messages?: Json | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes_verifications: {
        Row: {
          chapter_name: string
          class_level: string
          feedback: string | null
          id: string
          score: number
          student_notes: string
          subject: string
          topics_covered: string[] | null
          topics_missed: string[] | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          chapter_name: string
          class_level: string
          feedback?: string | null
          id?: string
          score: number
          student_notes: string
          subject: string
          topics_covered?: string[] | null
          topics_missed?: string[] | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          chapter_name?: string
          class_level?: string
          feedback?: string | null
          id?: string
          score?: number
          student_notes?: string
          subject?: string
          topics_covered?: string[] | null
          topics_missed?: string[] | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_level: string | null
          created_at: string | null
          full_name: string | null
          id: string
          last_active_date: string | null
          preferred_language: string | null
          streak_days: number | null
          study_style: string | null
          updated_at: string | null
          weak_subjects: string[] | null
        }
        Insert: {
          class_level?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          last_active_date?: string | null
          preferred_language?: string | null
          streak_days?: number | null
          study_style?: string | null
          updated_at?: string | null
          weak_subjects?: string[] | null
        }
        Update: {
          class_level?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_active_date?: string | null
          preferred_language?: string | null
          streak_days?: number | null
          study_style?: string | null
          updated_at?: string | null
          weak_subjects?: string[] | null
        }
        Relationships: []
      }
      topic_progress: {
        Row: {
          chapter_name: string
          completed_at: string | null
          id: string
          subject: string
          topic_key: string
          topic_title: string | null
          user_id: string
        }
        Insert: {
          chapter_name: string
          completed_at?: string | null
          id?: string
          subject: string
          topic_key: string
          topic_title?: string | null
          user_id: string
        }
        Update: {
          chapter_name?: string
          completed_at?: string | null
          id?: string
          subject?: string
          topic_key?: string
          topic_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unlocked_chapters: {
        Row: {
          chapter_name: string
          class_level: string
          id: string
          is_free: boolean | null
          subject: string
          unlocked_at: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          chapter_name: string
          class_level: string
          id?: string
          is_free?: boolean | null
          subject: string
          unlocked_at?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          chapter_name?: string
          class_level?: string
          id?: string
          is_free?: boolean | null
          subject?: string
          unlocked_at?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_body?: string
          p_link?: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
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
