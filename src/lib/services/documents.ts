import { supabase } from '../supabase'
import { Database } from '../database.types'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export class DocumentsService {
  // Get all documents for the current user
  static async getUserDocuments(): Promise<{ data: Document[] | null; error: any }> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Get a specific document by ID
  static async getDocument(id: string): Promise<{ data: Document | null; error: any }> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Create a new document
  static async createDocument(document: Omit<DocumentInsert, 'user_id'>): Promise<{ data: Document | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        user_id: user.id,
      })
      .select()
      .single()

    return { data, error }
  }

  // Update a document
  static async updateDocument(id: string, updates: DocumentUpdate): Promise<{ data: Document | null; error: any }> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Delete a document
  static async deleteDocument(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Count words in content (handles both plain text and HTML)
  static countWords(content: string): number {
    if (!content || content.trim().length === 0) return 0
    
    // Strip HTML tags and decode HTML entities for accurate word count
    const plainText = content
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&[^;]+;/g, ' ') // Replace other HTML entities
      .trim()
    
    if (plainText.length === 0) return 0
    return plainText.split(/\s+/).filter(word => word.length > 0).length
  }

  // Update word count for a document
  static async updateWordCount(id: string, content: string): Promise<{ data: Document | null; error: any }> {
    const wordCount = this.countWords(content)
    
    return this.updateDocument(id, { 
      content, 
      word_count: wordCount
      // status field omitted to avoid constraint violations
    })
  }
} 