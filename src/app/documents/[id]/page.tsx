'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { DocumentsService } from '@/lib/services/documents'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { DocumentEditorLayout } from '@/components/DocumentEditorLayout'
import { useGrammarContext } from '@/lib/contexts/GrammarContext'
import { Editor } from '@tiptap/core'
import { 
  Save, 
  ArrowLeft,
  FileText
} from 'lucide-react'
import { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'

type Document = Database['public']['Tables']['documents']['Row']

interface DocumentEditorProps {
  params: Promise<{
    id: string
  }>
}

export default function DocumentEditor({ params }: DocumentEditorProps) {
  const resolvedParams = use(params)
  const { user, loading: authLoading } = useAuth()
  const { checkGrammar, isChecking } = useGrammarContext()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [lastCheckedContent, setLastCheckedContent] = useState('')

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await DocumentsService.getDocument(resolvedParams.id)
      
      if (error) {
        setError(error.message)
      } else if (data) {
        setDocument(data)
        setTitle(data.title)
        setContent(data.content || '')
        setLastCheckedContent('') // Reset grammar check content when loading new document
      } else {
        setError('Document not found')
      }
    } catch {
      setError('Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  const handleAutoSave = useCallback(async () => {
    if (!document || autoSaving || saving) return

    try {
      setAutoSaving(true)
      setError(null)
      
      const wordCount = DocumentsService.countWords(content)
      
      const { error } = await DocumentsService.updateDocument(document.id, {
        title,
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString()
      })

      if (error) {
        // Don't show auto-save errors as prominently
        console.error('Auto-save failed:', error.message)
      } else {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setAutoSaving(false)
    }
  }, [document, autoSaving, saving, title, content])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    if (user) {
      loadDocument()
    }
  }, [user, authLoading, router, loadDocument])

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!document || !hasUnsavedChanges) return

    const autoSaveTimeout = setTimeout(async () => {
      await handleAutoSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout)
  }, [document, hasUnsavedChanges, handleAutoSave])

  // Auto-suggestion functionality with debouncing
  useEffect(() => {
    if (!editor || isChecking) return

    const text = editor.getText().trim()
    
    // Only check if text has actually changed and has meaningful content
    if (!text || text.length < 10 || text === lastCheckedContent) return

    const autoSuggestionTimeout = setTimeout(async () => {
      console.log('Auto-checking grammar for text:', text.substring(0, 50) + '...')
      await checkGrammar(text)
      setLastCheckedContent(text)
    }, 1000) // Auto-check after 1 second of inactivity

    return () => clearTimeout(autoSuggestionTimeout)
  }, [editor, content, isChecking, lastCheckedContent, checkGrammar])

  // Track changes to content
  useEffect(() => {
    if (document) {
      const titleChanged = title !== document.title
      const contentChanged = content !== (document.content || '')
      setHasUnsavedChanges(titleChanged || contentChanged)
    }
  }, [title, content, document])

  const handleSave = async () => {
    if (!document) return

    try {
      setSaving(true)
      setError(null)
      
      const wordCount = DocumentsService.countWords(content)
      
      const { error } = await DocumentsService.updateDocument(document.id, {
        title,
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString()
      })

      if (error) {
        setError(error.message)
      } else {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }
    } catch {
      setError('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    router.push('/documents')
  }

  const handleEditorReady = (editorInstance: Editor) => {
    setEditor(editorInstance)
  }

  // Prevent browser navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (authLoading || !user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-slate-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-slate-600">Loading document...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !document) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">Document not found</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DocumentEditorLayout editor={editor}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
            
            <div className="flex items-center space-x-4">
              {/* Status indicators */}
              <div className="text-sm space-y-1">
                <div>
                  {autoSaving ? (
                    <span className="text-blue-600 font-medium">Auto-saving...</span>
                  ) : hasUnsavedChanges ? (
                    <span className="text-amber-600 font-medium">Unsaved changes</span>
                  ) : lastSaved ? (
                    <span className="text-green-600 font-medium">
                      Saved at {lastSaved.toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-slate-500">Ready</span>
                  )}
                </div>
                {isChecking && (
                  <div>
                    <span className="text-purple-600 font-medium">Checking grammar...</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleSave}
                disabled={saving || autoSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Now'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-slate-200">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title"
                className="text-2xl font-bold w-full outline-none"
              />
            </div>
            <div className="p-6">
              <RichTextEditor
                content={content}
                onChange={setContent}
                onEditorReady={handleEditorReady}
              />
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Word Count: {DocumentsService.countWords(content)}</p>
          </div>
        </div>
      </div>
    </DocumentEditorLayout>
  )
} 