'use client'

import { createContext, useContext, ReactNode } from 'react'
import { GrammarCheckResult, GrammarSuggestion, useGrammarCheck } from '@/lib/hooks/useGrammarCheck'
import { Editor } from '@tiptap/core'
import { applySingleSuggestion } from '@/lib/utils/grammarHighlight'

interface GrammarContextType {
  // Grammar check state
  result: GrammarCheckResult | null
  isChecking: boolean
  error: string | null
  
  // Actions
  checkGrammar: (text: string) => Promise<GrammarCheckResult | null>
  applySuggestion: (suggestion: GrammarSuggestion, editor: Editor) => boolean
  applyAllSuggestions: (editor: Editor) => void
  clearSuggestions: () => void
  clearError: () => void
}

const GrammarContext = createContext<GrammarContextType | undefined>(undefined)

export function GrammarProvider({ children }: { children: ReactNode }) {
  const { checkGrammar, isChecking, error, lastResult, clearError, clearResult } = useGrammarCheck()
  
  const applySuggestion = (suggestion: GrammarSuggestion, editor: Editor): boolean => {
    if (!editor) {
      console.warn('Editor not available for applying suggestion')
      return false
    }

    // Use the improved helper function
    const success = applySingleSuggestion(editor, suggestion)
    
    if (success) {
      console.log('Successfully applied suggestion:', suggestion.original, '→', suggestion.suggestion)
    } else {
      console.warn('Failed to apply suggestion - text not found:', suggestion.original)
    }
    
    return success
  }

  const applyAllSuggestions = (editor: Editor) => {
    if (!lastResult || !editor) {
      console.warn('Editor or suggestions not available for applying all suggestions')
      return
    }
    
    // Get the corrected text and set it as the entire editor content
    // This preserves the basic structure while applying all corrections
    const correctedText = lastResult.correctedText
    
    if (correctedText) {
      // Clear the editor and insert the corrected text
      editor
        .chain()
        .focus()
        .selectAll()
        .insertContent(correctedText)
        .run()
      
      console.log('Applied all suggestions using corrected text')
      clearResult()
    } else {
      console.warn('No corrected text available in grammar check result')
    }
  }

  const clearSuggestions = () => {
    clearResult()
  }

  return (
    <GrammarContext.Provider
      value={{
        result: lastResult,
        isChecking,
        error,
        checkGrammar,
        applySuggestion,
        applyAllSuggestions,
        clearSuggestions,
        clearError,
      }}
    >
      {children}
    </GrammarContext.Provider>
  )
}

export function useGrammarContext() {
  const context = useContext(GrammarContext)
  if (context === undefined) {
    throw new Error('useGrammarContext must be used within a GrammarProvider')
  }
  return context
} 