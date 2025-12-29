export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      docs: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          locale: string
          order_index: number | null
          parent_id: string | null
          show_toc: boolean | null
          slug: string
          title: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          parent_id?: string | null
          show_toc?: boolean | null
          slug: string
          title: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          locale?: string
          order_index?: number | null
          parent_id?: string | null
          show_toc?: boolean | null
          slug?: string
          title?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "docs_topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
  }
}
