export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string
          weekly_generations_remaining: number
          last_generation_reset_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          weekly_generations_remaining?: number
          last_generation_reset_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          weekly_generations_remaining?: number
          last_generation_reset_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      generations: {
        Row: {
          id: string
          user_id: string
          prompt_text: string
          image_url: string // Can be a data URI or a URL to Supabase Storage
          model_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_text: string
          image_url: string
          model_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_text?: string
          image_url?: string
          model_used?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
