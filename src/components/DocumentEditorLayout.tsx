'use client'

import { ReactNode } from 'react'
import { useGrammarContext } from '@/lib/contexts/GrammarContext'
import { GrammarSidebarPanel } from './GrammarSidebarPanel'
import { GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'
import { Editor } from '@tiptap/core'

interface DocumentEditorLayoutProps {
  children: ReactNode
  editor?: Editor | null
}

export function DocumentEditorLayout({ 
  children, 
  editor
}: DocumentEditorLayoutProps) {
  const { result, isChecking, clearSuggestions, applySuggestion, applyAllSuggestions } = useGrammarContext()

  const handleApplySuggestion = (suggestion: GrammarSuggestion): boolean => {
    if (editor) {
      return applySuggestion(suggestion, editor)
    }
    return false
  }

  const handleApplyAllSuggestions = () => {
    if (editor) {
      applyAllSuggestions(editor)
    }
  }

  return (
    <>
      {/* Main content with right margin when suggestions panel is visible */}
      <div className="mr-96">
        {children}
      </div>
      
      {/* Grammar Suggestions Panel - Always visible in document editor */}
      <GrammarSidebarPanel
        result={result}
        onApplySuggestion={handleApplySuggestion}
        onApplyAllSuggestions={handleApplyAllSuggestions}
        onClearSuggestions={clearSuggestions}
        isChecking={isChecking}
      />
    </>
  )
} 