'use client'

import { ReactNode } from 'react'
import { useGrammarContext } from '@/lib/contexts/GrammarContext'
import { GrammarSidebarPanel } from './GrammarSidebarPanel'
import { GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'

interface DocumentEditorLayoutProps {
  children: ReactNode
}

export function DocumentEditorLayout({ children }: DocumentEditorLayoutProps) {
  const { result, isChecking, clearSuggestions } = useGrammarContext()

  const handleApplySuggestion = (suggestion: GrammarSuggestion) => {
    // This will be handled by the RichTextEditor through context
    console.log('Apply suggestion:', suggestion)
  }

  const handleApplyAllSuggestions = () => {
    // This will be handled by the RichTextEditor through context
    console.log('Apply all suggestions')
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