import { Editor } from '@tiptap/core'
import { GrammarSuggestion } from '@/lib/hooks/useGrammarCheck'

// Grammar highlight types with their corresponding colors
const GRAMMAR_HIGHLIGHT_COLORS = {
  grammar: '#fee2e2',
  spelling: '#fef08a', 
  punctuation: '#bfdbfe',
  style: '#e9d5ff',
} as const

// Function to find text positions in the editor content
function findTextPosition(text: string, searchText: string, startFrom = 0): { start: number; end: number } | null {
  const index = text.indexOf(searchText, startFrom)
  if (index === -1) return null
  
  return {
    start: index,
    end: index + searchText.length
  }
}

// Function to find all positions of a text in the editor content
// Currently unused but kept for potential future use
// function findAllTextPositions(text: string, searchText: string): Array<{ start: number; end: number }> {
//   const positions = []
//   let startFrom = 0
//   
//   while (startFrom < text.length) {
//     const position = findTextPosition(text, searchText, startFrom)
//     if (!position) break
//     
//     positions.push(position)
//     startFrom = position.end
//   }
//   
//   return positions
// }

// Function to apply a single grammar suggestion
export function applySingleSuggestion(editor: Editor, suggestion: GrammarSuggestion): boolean {
  if (!editor) return false

  const editorText = editor.getText()
  
  // Find the position of the original text in the editor
  const position = findTextPosition(editorText, suggestion.original)
  
  if (position) {
    const startPos = position.start + 1 // TipTap positions are 1-based
    const endPos = position.end + 1
    
    // Replace the text in the editor
    editor
      .chain()
      .focus()
      .setTextSelection({ from: startPos, to: endPos })
      .insertContent(suggestion.suggestion)
      .run()
    
    return true
  }
  
  return false
}

// Function to apply grammar highlights to the editor
export function applyGrammarHighlights(editor: Editor, suggestions: GrammarSuggestion[]) {
  if (!editor) return

  // First clear any existing grammar highlights
  clearGrammarHighlights(editor)

  const editorText = editor.getText()
  const processedPositions: Array<{ start: number; end: number }> = []

  suggestions.forEach((suggestion) => {
    // Find the position of the original text in the editor
    let searchStart = 0
    let position = null

    // Try to find a unique position that hasn't been processed yet
    while (searchStart < editorText.length) {
      const potentialPosition = findTextPosition(editorText, suggestion.original, searchStart)
      
      if (!potentialPosition) break

      // Check if this position overlaps with already processed positions
      const overlaps = processedPositions.some(processed => 
        (potentialPosition.start >= processed.start && potentialPosition.start < processed.end) ||
        (potentialPosition.end > processed.start && potentialPosition.end <= processed.end) ||
        (potentialPosition.start <= processed.start && potentialPosition.end >= processed.end)
      )

      if (!overlaps) {
        position = potentialPosition
        processedPositions.push(position)
        break
      }

      searchStart = potentialPosition.end
    }

    if (position) {
      // Apply highlight with appropriate color for the suggestion type
      const color = GRAMMAR_HIGHLIGHT_COLORS[suggestion.type] || GRAMMAR_HIGHLIGHT_COLORS.grammar
      
      editor
        .chain()
        .focus()
        .setTextSelection({ from: position.start + 1, to: position.end + 1 })
        .setHighlight({ color })
        .run()
    }
  })
}

// Function to clear all grammar highlights
export function clearGrammarHighlights(editor: Editor) {
  if (!editor) return

  const { state } = editor
  const { doc } = state
  const tr = state.tr
  let hasChanges = false

  doc.descendants((node, pos) => {
    if (node.marks) {
      node.marks.forEach(mark => {
        if (mark.type.name === 'highlight') {
          const color = mark.attrs.color
          // Check if it's one of our grammar highlight colors
          if (color && Object.values(GRAMMAR_HIGHLIGHT_COLORS).includes(color)) {
            tr.removeMark(pos, pos + node.nodeSize, mark.type)
            hasChanges = true
          }
        }
      })
    }
  })

  if (hasChanges) {
    editor.view.dispatch(tr)
  }
} 