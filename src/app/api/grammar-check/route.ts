import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o mini as it's the most current efficient model
      messages: [
        {
          role: "system",
          content: `You are a professional grammar and spelling checker. Analyze the provided text and return suggestions for improvements. Focus on:
          1. Grammar errors
          2. Spelling mistakes
          3. Punctuation issues
          4. Style improvements
          5. Clarity enhancements

          Return your response as a JSON object with this structure:
          {
            "suggestions": [
              {
                "type": "grammar|spelling|punctuation|style",
                "original": "original text segment",
                "suggestion": "improved text segment",
                "explanation": "brief explanation of the issue",
                "position": { "start": number, "end": number }
              }
            ],
            "correctedText": "full corrected version of the text",
            "summary": "brief summary of issues found"
          }

          If no issues are found, return empty suggestions array but still provide the original text as correctedText.`
        },
        {
          role: "user",
          content: `Please check this text for grammar and spelling: "${text}"`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const result = completion.choices[0]?.message?.content
    
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    const parsedResult = JSON.parse(result)
    
    return NextResponse.json({
      success: true,
      data: parsedResult
    })

  } catch (error) {
    console.error('Grammar check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check grammar and spelling',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 