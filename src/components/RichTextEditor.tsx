'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from './ui/button'
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useState } from 'react'
import { useGrammarCheck, GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'
import { GrammarSuggestionsPanel } from './GrammarSuggestionsPanel'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { checkGrammar, isChecking, error, lastResult, clearError, clearResult } = useGrammarCheck()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const handleGrammarCheck = async () => {
    const text = editor.getText()
    if (!text.trim()) return

    const result = await checkGrammar(text)
    if (result) {
      setShowSuggestions(true)
    }
  }

  const handleApplySuggestion = (suggestion: GrammarSuggestion) => {
    const currentText = editor.getText()
    const newText = currentText.replace(suggestion.original, suggestion.suggestion)
    editor.commands.setContent(newText)
    onChange(editor.getHTML())
  }

  const handleApplyAllSuggestions = () => {
    if (!lastResult) return
    
    let currentText = editor.getText()
    lastResult.suggestions.forEach(suggestion => {
      currentText = currentText.replace(suggestion.original, suggestion.suggestion)
    })
    
    editor.commands.setContent(currentText)
    onChange(editor.getHTML())
    setShowSuggestions(false)
    clearResult()
  }

  const handleCloseSuggestions = () => {
    setShowSuggestions(false)
    clearResult()
    clearError()
  }

  return (
    <div>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-3 bg-slate-50">
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 ${
                editor.isActive('bold') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bold"
            >
              <BoldIcon className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 ${
                editor.isActive('italic') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Italic"
            >
              <ItalicIcon className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 ${
                editor.isActive('underline') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-2" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 ${
                editor.isActive('bulletList') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 ${
                editor.isActive('orderedList') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 ${
                editor.isActive('blockquote') 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-2" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 bg-white border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 bg-white border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-2" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGrammarCheck}
              disabled={isChecking || !editor.getText().trim()}
              className="p-2 bg-white border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Check Grammar & Spelling"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          <EditorContent 
            editor={editor} 
            className="prose prose-slate max-w-none focus:outline-none min-h-[400px]"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            <p>Grammar check error: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Grammar Suggestions Panel */}
      {showSuggestions && (
        <div className="mt-4">
          <GrammarSuggestionsPanel
            result={lastResult}
            onApplySuggestion={handleApplySuggestion}
            onApplyAllSuggestions={handleApplyAllSuggestions}
            onClose={handleCloseSuggestions}
          />
        </div>
      )}
    </div>
  )
} 