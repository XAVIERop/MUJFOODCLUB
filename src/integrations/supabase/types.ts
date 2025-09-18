export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cafes: {
        Row: {
          created_at: string
          description: string | null
          hours: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string
          name: string
          phone: string
          rating: number | null
          total_reviews: number | null
          type: string
          updated_at: string
          average_rating: number | null
          total_ratings: number | null
          cuisine_categories: string[] | null
          priority: number | null
          slug: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hours: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location: string
          name: string
          phone: string
          rating?: number | null
          total_reviews?: number | null
          type: string
          updated_at?: string
          average_rating?: number | null
          total_ratings?: number | null
          cuisine_categories?: string[] | null
          priority?: number | null
          slug?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hours?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string
          name?: string
          phone?: string
          rating?: number | null
          total_reviews?: number | null
          type?: string
          updated_at?: string
          average_rating?: number | null
          total_ratings?: number | null
          cuisine_categories?: string[] | null
          priority?: number | null
          slug?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          order_id: string | null
          points_change: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          points_change: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          points_change?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          cafe_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          preparation_time: number | null
          price: number
          updated_at: string
        }
        Insert: {
          cafe_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          preparation_time?: number | null
          price: number
          updated_at?: string
        }
        Update: {
          cafe_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          preparation_time?: number | null
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
          notes: string | null
        }
        Insert: {
          id?: string
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
          notes?: string | null
        }
        Update: {
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          cafe_id: string
          order_number: string
          total_amount: number
          delivery_block: string
          delivery_notes: string | null
          payment_method: string
          points_earned: number
          estimated_delivery: string
          created_at: string
          status_updated_at: string
          points_credited: boolean
          has_rating?: boolean
          rating_submitted_at?: string | null
          phone_number?: string | null
          table_number?: string | null
          delivered_by_staff_id?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          cafe_id: string
          order_number: string
          total_amount: number
          delivery_block: string
          delivery_notes?: string | null
          payment_method: string
          points_earned: number
          estimated_delivery: string
          created_at?: string
          status_updated_at?: string
          points_credited?: boolean
          has_rating?: boolean
          rating_submitted_at?: string | null
          phone_number?: string | null
          table_number?: string | null
          delivered_by_staff_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          cafe_id?: string
          order_number?: string
          total_amount?: number
          delivery_block?: string
          delivery_notes?: string | null
          payment_method?: string
          points_earned?: number
          estimated_delivery?: string
          created_at?: string
          status_updated_at?: string
          points_credited?: boolean
          has_rating?: boolean
          rating_submitted_at?: string | null
          phone_number?: string | null
          table_number?: string | null
          delivered_by_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_tables: {
        Row: {
          id: string
          cafe_id: string
          table_number: string
          qr_code: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_id: string
          table_number: string
          qr_code?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_id?: string
          table_number?: string
          qr_code?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_tables_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          block: Database["public"]["Enums"]["block_type"]
          created_at: string
          email: string
          full_name: string
          id: string
          loyalty_points: number
          loyalty_tier: Database["public"]["Enums"]["loyalty_tier"]
          phone: string | null
          qr_code: string
          student_id: string | null
          total_orders: number
          total_spent: number
          updated_at: string
          user_type: string
          cafe_id: string | null
          tier_expiry_date: string | null
          maintenance_spent: number | null
          new_user_orders_count: number | null
          is_new_user: boolean | null
          first_order_date: string | null
          tier_warning_sent: boolean | null
          last_maintenance_check: string | null
        }
        Insert: {
          block: Database["public"]["Enums"]["block_type"]
          created_at?: string
          email: string
          full_name: string
          id: string
          loyalty_points?: number
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"]
          phone?: string | null
          qr_code?: string
          student_id?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_type?: string
          cafe_id?: string | null
        }
        Update: {
          block?: Database["public"]["Enums"]["block_type"]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          loyalty_points?: number
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"]
          phone?: string | null
          qr_code?: string
          student_id?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_type?: string
          cafe_id?: string | null
        }
        Relationships: []
      }
      cafe_staff: {
        Row: {
          id: string
          cafe_id: string
          user_id: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_id: string
          user_id: string
          role: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_id?: string
          user_id?: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_staff_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_notifications: {
        Row: {
          id: string
          order_id: string
          cafe_id: string
          notification_type: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          cafe_id: string
          notification_type: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          cafe_id?: string
          notification_type?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_notifications_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          }
        ]
      }
      cafe_ratings: {
        Row: {
          id: string
          cafe_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          cafe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cafe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cafe_id?: string
          created_at?: string
        }
      }
      tier_maintenance: {
        Row: {
          id: string
          user_id: string
          tier: string
          maintenance_amount: number
          current_spent: number
          period_start_date: string
          period_end_date: string
          is_completed: boolean
          warning_sent: boolean
          grace_period_start: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: string
          maintenance_amount: number
          current_spent?: number
          period_start_date?: string
          period_end_date?: string
          is_completed?: boolean
          warning_sent?: boolean
          grace_period_start?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: string
          maintenance_amount?: number
          current_spent?: number
          period_start_date?: string
          period_end_date?: string
          is_completed?: boolean
          warning_sent?: boolean
          grace_period_start?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_maintenance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_bonuses: {
        Row: {
          id: string
          user_id: string
          bonus_type: string
          points_awarded: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bonus_type: string
          points_awarded: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bonus_type?: string
          points_awarded?: number
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bonuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      maintenance_periods: {
        Row: {
          id: string
          user_id: string
          tier: string
          start_date: string
          period_end_date: string
          required_amount: number
          actual_spent: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: string
          start_date?: string
          period_end_date?: string
          required_amount: number
          actual_spent?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: string
          start_date?: string
          period_end_date?: string
          required_amount?: number
          actual_spent?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_periods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_ratings: {
        Row: {
          id: string
          order_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_enhanced_points: {
        Args: {
          order_amount: number
          user_id: string
          is_new_user: boolean
          new_user_orders_count: number
        }
        Returns: number
      }
      handle_new_user_first_order: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      track_maintenance_spending: {
        Args: {
          user_id: string
          order_amount: number
        }
        Returns: undefined
      }
      check_maintenance_expiry: {
        Args: {}
        Returns: undefined
      }
      get_user_enhanced_rewards_summary: {
        Args: {
          user_id: string
        }
        Returns: {
          current_tier: string
          current_points: number
          tier_multiplier: number
          next_tier_points: number
          maintenance_required: number
          maintenance_spent: number
          maintenance_days_remaining: number
          is_new_user: boolean
          new_user_orders_count: number
          new_user_bonus_active: boolean
        }[]
      }
      get_order_rating_summary: {
        Args: {
          order_id: string
        }
        Returns: {
          average_rating: number
          total_ratings: number
          rating_distribution: unknown
        }[]
      }
    }
    Enums: {
      block_type:
        | "B1"
        | "B2"
        | "B3"
        | "B4"
        | "B5"
        | "B6"
        | "B7"
        | "B8"
        | "B9"
        | "B10"
        | "B11"
        | "G1"
        | "G2"
        | "G3"
        | "G4"
        | "G5"
        | "G6"
        | "G7"
        | "TAKEAWAY"
        | "DINE_IN"
      loyalty_tier: "foodie" | "gourmet" | "connoisseur"
      order_status:
        | "received"
        | "confirmed"
        | "preparing"
        | "on_the_way"
        | "completed"
        | "cancelled"
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
    Enums: {
      block_type: [
        "B1",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "B7",
        "B8",
        "B9",
        "B10",
        "B11",
        "B12",
        "G1",
        "G2",
        "G3",
        "G4",
        "G5",
        "G6",
        "G7",
        "G8",
      ],
      loyalty_tier: ["foodie", "gourmet", "connoisseur"],
      order_status: [
        "received",
        "confirmed",
        "preparing",
        "on_the_way",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
