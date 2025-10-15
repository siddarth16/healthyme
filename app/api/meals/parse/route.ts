import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseMealText } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Get user preferences for better parsing
    const { data: profile } = await supabase
      .from('profiles')
      .select('dietary_preference, cuisine_bias')
      .eq('id', user.id)
      .single()

    const result = await parseMealText(text, {
      dietary_preference: profile?.dietary_preference,
      cuisine_bias: profile?.cuisine_bias,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error parsing meal:', error)
    return NextResponse.json(
      { error: 'Failed to parse meal text' },
      { status: 500 }
    )
  }
}
