'use client'

import { useState, useEffect } from 'react'
import { GrammarCheckResult, GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'
import { GrammarSuggestionsPanel } from './GrammarSuggestionsPanel'
import { 
  FileText,
  Sparkles,
  CheckCircle
} from 'lucide-react'

interface GrammarSidebarPanelProps {
  result: GrammarCheckResult | null
  onApplySuggestion: (suggestion: GrammarSuggestion) => boolean
  onApplyAllSuggestions: () => void
  onClearSuggestions: () => void
  isChecking: boolean
}

export function GrammarSidebarPanel({
  result,
  onApplySuggestion,
  onApplyAllSuggestions,
  onClearSuggestions,
  isChecking,
}: GrammarSidebarPanelProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (result) {
      setShowSuggestions(true)
    }
  }, [result])

  const handleClose = () => {
    setShowSuggestions(false)
    onClearSuggestions()
  }

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white border-l border-slate-200 shadow-lg z-40 overflow-y-auto">
      <div className="p-4 h-full">
        {showSuggestions && result ? (
          <GrammarSuggestionsPanel
            result={result}
            onApplySuggestion={onApplySuggestion}
            onApplyAllSuggestions={onApplyAllSuggestions}
            onClose={handleClose}
          />
        ) : (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Writing Assistant</h3>
                <p className="text-sm text-slate-600">Grammar & Style Suggestions</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <div>
                    <p className="text-lg font-medium text-slate-900">Analyzing your text...</p>
                    <p className="text-sm text-slate-600">Checking for grammar and style improvements</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-100 rounded-full">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-900">Ready to help</p>
                    <p className="text-sm text-slate-600">Click the grammar check button in your editor to get started</p>
                  </div>
                </>
              )}
            </div>

            {/* Features */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-slate-900">What I can help with:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Grammar corrections</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Spelling mistakes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Punctuation improvements</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Style enhancements</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 