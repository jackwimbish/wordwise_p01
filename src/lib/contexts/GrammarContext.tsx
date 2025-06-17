'use client'

import { createContext, useContext, ReactNode } from 'react'
import { GrammarCheckResult, GrammarSuggestion, useGrammarCheck } from '@/lib/hooks/useGrammarCheck'

interface GrammarContextType {
  // Grammar check state
  result: GrammarCheckResult | null
  isChecking: boolean
  error: string | null
  
  // Actions
  checkGrammar: (text: string) => Promise<GrammarCheckResult | null>
  applySuggestion: (suggestion: GrammarSuggestion, updateText: (newText: string) => void) => void
  applyAllSuggestions: (updateText: (newText: string) => void) => void
  clearSuggestions: () => void
  clearError: () => void
}

const GrammarContext = createContext<GrammarContextType | undefined>(undefined)

export function GrammarProvider({ children }: { children: ReactNode }) {
  const { checkGrammar, isChecking, error, lastResult, clearError, clearResult } = useGrammarCheck()
  
  const applySuggestion = (suggestion: GrammarSuggestion, updateText: (newText: string) => void) => {
    // This will be implemented by the caller to update their specific text
    updateText(suggestion.suggestion)
  }

  const applyAllSuggestions = (updateText: (newText: string) => void) => {
    if (!lastResult) return
    
    // Apply all suggestions by calling updateText with the corrected text
    updateText(lastResult.correctedText)
    clearResult()
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