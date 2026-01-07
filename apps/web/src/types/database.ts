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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          content: string | null
          id: string
          locale: string
          order_index: number | null
          section_key: string
          title: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          content?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          section_key: string
          title: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          content?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          section_key?: string
          title?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          blog_post_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'blog_post_tags_blog_post_id_fkey'
            columns: ['blog_post_id']
            isOneToOne: false
            referencedRelation: 'blog_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blog_post_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      blog_posts: {
        Row: {
          allow_comments: boolean | null
          author_id: string | null
          content: string
          content_hash: string | null
          cover_media_id: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          locale: string
          meta_description: string | null
          og_media_id: string | null
          published_at: string | null
          reading_time_minutes: number | null
          search_text: string | null
          search_vector: unknown
          series_id: string | null
          series_order: number | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          allow_comments?: boolean | null
          author_id?: string | null
          content: string
          content_hash?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          locale?: string
          meta_description?: string | null
          og_media_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          search_text?: string | null
          search_vector?: unknown
          series_id?: string | null
          series_order?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          allow_comments?: boolean | null
          author_id?: string | null
          content?: string
          content_hash?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          locale?: string
          meta_description?: string | null
          og_media_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          search_text?: string | null
          search_vector?: unknown
          series_id?: string | null
          series_order?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'blog_posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blog_posts_cover_media_id_fkey'
            columns: ['cover_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blog_posts_og_media_id_fkey'
            columns: ['og_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blog_posts_series_id_fkey'
            columns: ['series_id']
            isOneToOne: false
            referencedRelation: 'blog_posts'
            referencedColumns: ['id']
          },
        ]
      }
      docs: {
        Row: {
          content: string
          content_hash: string | null
          created_at: string | null
          description: string | null
          id: string
          locale: string
          order_index: number | null
          parent_id: string | null
          reading_time_minutes: number | null
          search_text: string | null
          show_toc: boolean | null
          slug: string
          title: string
          toc: Json | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          parent_id?: string | null
          reading_time_minutes?: number | null
          search_text?: string | null
          show_toc?: boolean | null
          slug: string
          title: string
          toc?: Json | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          parent_id?: string | null
          reading_time_minutes?: number | null
          search_text?: string | null
          show_toc?: boolean | null
          slug?: string
          title?: string
          toc?: Json | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'docs_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'docs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'docs_topic_id_fkey'
            columns: ['topic_id']
            isOneToOne: false
            referencedRelation: 'docs_topics'
            referencedColumns: ['id']
          },
        ]
      }
      docs_topics: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          bytes: number | null
          caption: string | null
          created_by: string | null
          duration: number | null
          folder: string | null
          format: string | null
          height: number | null
          id: string
          metadata: Json | null
          public_id: string
          resource_type: string
          tags: string[] | null
          uploaded_at: string | null
          version: number
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bytes?: number | null
          caption?: string | null
          created_by?: string | null
          duration?: number | null
          folder?: string | null
          format?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          public_id: string
          resource_type: string
          tags?: string[] | null
          uploaded_at?: string | null
          version: number
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bytes?: number | null
          caption?: string | null
          created_by?: string | null
          duration?: number | null
          folder?: string | null
          format?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          public_id?: string
          resource_type?: string
          tags?: string[] | null
          uploaded_at?: string | null
          version?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'media_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_media_id: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          github_username: string | null
          id: string
          linkedin_username: string | null
          role: string
          twitter_username: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_media_id?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          github_username?: string | null
          id: string
          linkedin_username?: string | null
          role?: string
          twitter_username?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_media_id?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          linkedin_username?: string | null
          role?: string
          twitter_username?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_profiles_avatar_media'
            columns: ['avatar_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      project_media: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          media_id: string
          order_index: number | null
          project_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_id: string
          order_index?: number | null
          project_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_id?: string
          order_index?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_media_media_id_fkey'
            columns: ['media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_media_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      project_tags: {
        Row: {
          created_at: string | null
          project_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          project_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_tags_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      project_tech_stack: {
        Row: {
          category: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          project_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          project_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_tech_stack_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          content_hash: string | null
          cover_media_id: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          end_date: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          locale: string
          long_description: string | null
          og_media_id: string | null
          order_index: number | null
          reading_time_minutes: number | null
          search_text: string | null
          search_vector: unknown
          slug: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_hash?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          end_date?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          locale?: string
          long_description?: string | null
          og_media_id?: string | null
          order_index?: number | null
          reading_time_minutes?: number | null
          search_text?: string | null
          search_vector?: unknown
          slug: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_hash?: string | null
          cover_media_id?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          end_date?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          locale?: string
          long_description?: string | null
          og_media_id?: string | null
          order_index?: number | null
          reading_time_minutes?: number | null
          search_text?: string | null
          search_vector?: unknown
          slug?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_cover_media_id_fkey'
            columns: ['cover_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_og_media_id_fkey'
            columns: ['og_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          proficiency: number | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          proficiency?: number | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          proficiency?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string
          icon: string | null
          id: string
          is_current: boolean | null
          locale: string
          media_id: string | null
          order_index: number | null
          start_date: string
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type: string
          icon?: string | null
          id?: string
          is_current?: boolean | null
          locale?: string
          media_id?: string | null
          order_index?: number | null
          start_date: string
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          icon?: string | null
          id?: string
          is_current?: boolean | null
          locale?: string
          media_id?: string | null
          order_index?: number | null
          start_date?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timeline_events_media_id_fkey'
            columns: ['media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_author: { Args: { author_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
