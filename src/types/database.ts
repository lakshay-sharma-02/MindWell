export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'moderator' | 'user'

export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          image: string | null
          category: string | null
          author: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          image?: string | null
          category?: string | null
          author?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          image?: string | null
          category?: string | null
          author?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      booking_services: {
        Row: {
          id: string
          title: string
          duration: string
          price: string
          description: string
          features: string[]
          popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          duration: string
          price: string
          description: string
          features?: string[]
          popular?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          duration?: string
          price?: string
          description?: string
          features?: string[]
          popular?: boolean
          created_at?: string
        }
      }

      resources: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          type: string | null
          image: string | null
          download_url: string | null
          is_premium: boolean
          price: number | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          type?: string | null
          image?: string | null
          download_url?: string | null
          is_premium?: boolean
          price?: number | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          type?: string | null
          image?: string | null
          download_url?: string | null
          is_premium?: boolean
          price?: number | null
          published?: boolean
          created_at?: string
        }
      }
      podcasts: {
        Row: {
          id: string
          title: string
          description: string | null
          duration: string | null
          audio_url: string | null
          image: string | null
          guest: string | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          duration?: string | null
          audio_url?: string | null
          image?: string | null
          guest?: string | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          duration?: string | null
          audio_url?: string | null
          image?: string | null
          guest?: string | null
          published?: boolean
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string | null
          content: string
          image: string | null
          rating: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          content: string
          image?: string | null
          rating?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          content?: string
          image?: string | null
          rating?: number
          published?: boolean
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: any // Using any for JSONB flexibility
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: any
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: any
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          name: string | null
          title: string
          content: string
          is_anonymous: boolean
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          title: string
          content: string
          is_anonymous?: boolean
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          title?: string
          content?: string
          is_anonymous?: boolean
          approved?: boolean
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          post_type: 'blog' | 'podcast'
          author_name: string
          content: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          post_type: 'blog' | 'podcast'
          author_name: string
          content: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          post_type?: 'blog' | 'podcast'
          author_name?: string
          content?: string
          approved?: boolean
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AppRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: AppRole
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: AppRole
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
          has_seen_tour: boolean
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          has_seen_tour?: boolean
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          has_seen_tour?: boolean
        }
      }
      blog_likes: {
        Row: {
          id: string
          user_id: string
          blog_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blog_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blog_id?: string
          created_at?: string
        }
      }
      purchased_resources: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          transaction_id?: string | null
          created_at?: string
        }
      }
      resource_likes: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: AppRole
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
