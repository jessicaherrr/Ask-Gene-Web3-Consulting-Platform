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
      profiles: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultants: {
        Row: {
          id: string
          wallet_address: string
          name: string
          title: string | null
          bio: string | null
          expertise: string[] | null
          hourly_rate: number
          min_duration_hours: number
          max_duration_hours: number
          rating: number
          total_sessions: number
          total_hours: number
          total_earnings: number
          is_verified: boolean
          is_active: boolean
          verification_level: string
          languages: string[] | null
          availability: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          name: string
          title?: string | null
          bio?: string | null
          expertise?: string[] | null
          hourly_rate: number
          min_duration_hours?: number
          max_duration_hours?: number
          rating?: number
          total_sessions?: number
          total_hours?: number
          total_earnings?: number
          is_verified?: boolean
          is_active?: boolean
          verification_level?: string
          languages?: string[] | null
          availability?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          name?: string
          title?: string | null
          bio?: string | null
          expertise?: string[] | null
          hourly_rate?: number
          min_duration_hours?: number
          max_duration_hours?: number
          rating?: number
          total_sessions?: number
          total_hours?: number
          total_earnings?: number
          is_verified?: boolean
          is_active?: boolean
          verification_level?: string
          languages?: string[] | null
          availability?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          id: string
          consultant_id: string
          client_wallet_address: string
          title: string
          description: string | null
          scheduled_for: string
          duration_hours: number
          hourly_rate: number
          total_amount: number
          status: string
          payment_status: string
          currency: string
          meeting_link: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          client_wallet_address: string
          title: string
          description?: string | null
          scheduled_for: string
          duration_hours: number
          hourly_rate: number
          total_amount: number
          status?: string
          payment_status?: string
          currency?: string
          meeting_link?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          client_wallet_address?: string
          title?: string
          description?: string | null
          scheduled_for?: string
          duration_hours?: number
          hourly_rate?: number
          total_amount?: number
          status?: string
          payment_status?: string
          currency?: string
          meeting_link?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_consultant_id_fkey"
            columns: ["consultant_id"]
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          consultation_id: string
          consultant_id: string
          client_wallet_address: string
          rating: number
          comment: string | null
          is_public: boolean
          is_anonymous: boolean
          ai_processed: boolean
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consultation_id: string
          consultant_id: string
          client_wallet_address: string
          rating: number
          comment?: string | null
          is_public?: boolean
          is_anonymous?: boolean
          ai_processed?: boolean
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consultation_id?: string
          consultant_id?: string
          client_wallet_address?: string
          rating?: number
          comment?: string | null
          is_public?: boolean
          is_anonymous?: boolean
          ai_processed?: boolean
          ai_summary?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_consultant_id_fkey"
            columns: ["consultant_id"]
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
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
