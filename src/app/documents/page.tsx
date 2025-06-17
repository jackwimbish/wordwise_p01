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
  Edit,
  Upload
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
  const [uploading, setUploading] = useState(false)

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
    } catch {
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
    } catch {
      setError('Failed to create document')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a text file
    const validTypes = ['text/plain', 'text/markdown', 'text/md', 'application/txt']
    const isTextFile = validTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.md')
    
    if (!isTextFile) {
      setError('Please upload a text file (.txt or .md)')
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Read the file content
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })

      // Create document title from filename (remove extension)
      const title = file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Document'

      // Create the document with the uploaded content
      const { data, error } = await DocumentsService.createDocument({
        title,
        content: text
      })

      if (error) {
        setError(error.message)
      } else if (data) {
        // Refresh the documents list
        loadDocuments()
        // Navigate to the new document
        router.push(`/documents/${data.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ''
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
    } catch {
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
          <div className="flex items-center space-x-3">
            {/* Upload Button */}
            <div className="relative">
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="file-upload"
              />
              <Button
                asChild
                variant="outline"
                disabled={uploading}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Text File
                    </>
                  )}
                </label>
              </Button>
            </div>
            
            {/* New Document Button */}
            <Button
              onClick={handleNewDocument}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Document
            </Button>
          </div>
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
            <p className="text-slate-500 mb-6">Create your first document or upload an existing text file</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="file-upload-empty"
                />
                <Button
                  asChild
                  variant="outline"
                  disabled={uploading}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  <label htmlFor="file-upload-empty" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload File
                      </>
                    )}
                  </label>
                </Button>
              </div>
              <Button
                onClick={handleNewDocument}
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Document
              </Button>
            </div>
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