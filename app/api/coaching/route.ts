import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCoachingResponse } from '@/lib/gemini/client'
import { subDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get last 7 days of meal logs
    const sevenDaysAgo = subDays(new Date(), 7).toISOString().split('T')[0]
    const { data: meals } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: false })

    // Calculate summaries for recent logs
    const dailySummaries = meals?.reduce((acc: any, meal: any) => {
      const date = meal.date
      if (!acc[date]) {
        acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }

      meal.items.forEach((item: any) => {
        acc[date].calories += item.calories
        acc[date].protein += item.protein_g
        acc[date].carbs += item.carbs_g
        acc[date].fat += item.fat_g
      })

      return acc
    }, {})

    // Generate coaching response
    const response = await generateCoachingResponse(message, profile, dailySummaries || {})

    // Save the conversation
    await supabase.from('coaching_messages').insert([
      {
        user_id: user.id,
        role: 'user',
        content: message,
      },
      {
        user_id: user.id,
        role: 'assistant',
        content: response,
      },
    ])

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in coaching route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error in coaching route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
