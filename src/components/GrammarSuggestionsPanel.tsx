'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { GrammarCheckResult, GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface GrammarSuggestionsPanelProps {
  result: GrammarCheckResult | null
  onApplySuggestion: (suggestion: GrammarSuggestion) => boolean
  onApplyAllSuggestions: () => void
  onClose: () => void
}

const typeIcons = {
  grammar: AlertCircle,
  spelling: XCircle,
  punctuation: FileText,
  style: Sparkles,
}

const typeColors = {
  grammar: 'text-red-600 bg-red-50 border-red-200',
  spelling: 'text-orange-600 bg-orange-50 border-orange-200',
  punctuation: 'text-blue-600 bg-blue-50 border-blue-200',
  style: 'text-purple-600 bg-purple-50 border-purple-200',
}

export function GrammarSuggestionsPanel({
  result,
  onApplySuggestion,
  onApplyAllSuggestions,
  onClose,
}: GrammarSuggestionsPanelProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set())
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())

  if (!result) {
    return null
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSuggestions(newExpanded)
  }

  const handleApplySuggestion = (suggestion: GrammarSuggestion, index: number) => {
    const success = onApplySuggestion(suggestion)
    if (success) {
      setAppliedSuggestions(prev => new Set(prev).add(index))
    }
  }

  const handleApplyAllSuggestions = () => {
    onApplyAllSuggestions()
    // Clear applied suggestions state since all suggestions will be applied
    setAppliedSuggestions(new Set())
  }

  const { suggestions } = result

  if (suggestions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Grammar Check Results</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 text-green-600">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-medium">Great job!</p>
            <p className="text-sm text-slate-600">No grammar or spelling issues found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Grammar & Spelling Suggestions</h3>
          <p className="text-sm text-slate-600">{suggestions.length} issues found</p>
        </div>
        <div className="flex items-center space-x-2">
          {suggestions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyAllSuggestions}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              Apply All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </Button>
        </div>
      </div>

      {result.summary && (
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <p className="text-sm text-slate-700">{result.summary}</p>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => {
          const Icon = typeIcons[suggestion.type]
          const isExpanded = expandedSuggestions.has(index)
          const isApplied = appliedSuggestions.has(index)

          return (
            <div
              key={index}
              className={`p-4 border-b border-slate-100 last:border-b-0 ${
                isApplied ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${typeColors[suggestion.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {suggestion.type}
                      </span>
                      {isApplied && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Applied
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                      className="p-1 h-auto text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="mt-1">
                    <p className="text-sm text-slate-900">
                      <span className="line-through text-slate-500">&quot;{suggestion.original}&quot;</span>
                      {' → '}
                      <span className="font-medium text-indigo-600">&quot;{suggestion.suggestion}&quot;</span>
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-slate-600">{suggestion.explanation}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion, index)}
                        disabled={isApplied}
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                      >
                        {isApplied ? 'Applied' : 'Apply Suggestion'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 