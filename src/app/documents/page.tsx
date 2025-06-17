'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { DocumentsService } from '@/lib/services/documents'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  FileText, 
  Trash2, 
  Calendar,
  Edit
} from 'lucide-react'
import { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'

type Document = Database['public']['Tables']['documents']['Row']

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    if (user) {
      loadDocuments()
    }
  }, [user, authLoading, router])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await DocumentsService.getUserDocuments()
      
      if (error) {
        setError(error.message)
      } else {
        setDocuments(data || [])
      }
    } catch (err) {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleNewDocument = async () => {
    try {
      const { data, error } = await DocumentsService.createDocument({
        title: 'Untitled Document',
        content: ''
        // status field omitted - it's nullable and will default to null
      })

      if (error) {
        setError(error.message)
      } else if (data) {
        // Refresh the documents list
        loadDocuments()
        // Navigate to the new document (you can implement editing later)
        router.push(`/documents/${data.id}`)
      }
    } catch (err) {
      setError('Failed to create document')
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const { error } = await DocumentsService.deleteDocument(documentId)
      
      if (error) {
        setError(error.message)
      } else {
        // Remove the document from the local state
        setDocuments(documents.filter(doc => doc.id !== documentId))
      }
    } catch (err) {
      setError('Failed to delete document')
    }
  }

  const handleOpenDocument = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (authLoading || !user) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-slate-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Documents</h1>
            <p className="text-slate-600 mt-2">Manage your writing projects</p>
          </div>
          <Button
            onClick={handleNewDocument}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Document
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-slate-600">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6">Create your first document to get started</p>
            <Button
              onClick={handleNewDocument}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Document
            </Button>
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate">
                        {document.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-500 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(document.updated_at)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {document.word_count !== null 
                          ? `${document.word_count} words`
                          : `${DocumentsService.countWords(document.content || '')} words`
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleOpenDocument(document.id)}
                        size="sm"
                        variant="outline"
                        className="p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteDocument(document.id)}
                        size="sm"
                        variant="outline"
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {document.content && (
                    <div className="text-sm text-slate-600 line-clamp-3">
                      {(() => {
                        // Strip HTML tags for preview display
                        const plainText = document.content
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/&[^;]+;/g, ' ')
                          .trim()
                        return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '')
                      })()}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button
                      onClick={() => handleOpenDocument(document.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Open Document
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 