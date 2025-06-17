import { useState } from 'react'

export interface GrammarSuggestion {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style'
  original: string
  suggestion: string
  explanation: string
  position: {
    start: number
    end: number
  }
}

export interface GrammarCheckResult {
  suggestions: GrammarSuggestion[]
  correctedText: string
  summary: string
}

export function useGrammarCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<GrammarCheckResult | null>(null)

  const checkGrammar = async (text: string): Promise<GrammarCheckResult | null> => {
    if (!text.trim()) {
      setError('No text provided')
      return null
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check grammar')
      }

      if (!data.success) {
        throw new Error(data.error || 'Grammar check failed')
      }

      const result = data.data as GrammarCheckResult
      setLastResult(result)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Grammar check error:', err)
      return null
    } finally {
      setIsChecking(false)
    }
  }

  const clearError = () => setError(null)
  const clearResult = () => setLastResult(null)

  return {
    checkGrammar,
    isChecking,
    error,
    lastResult,
    clearError,
    clearResult,
  }
} 