import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { original_text, items, date } = await request.json()

    if (!original_text || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        date: date || new Date().toISOString().split('T')[0],
        original_text,
        items,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving meal:', error)
      return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in meal route:', error)
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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('date', date)
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching meals:', error)
      return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in meal route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing meal ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting meal:', error)
      return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in meal route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
