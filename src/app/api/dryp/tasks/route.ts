import { NextResponse } from 'next/server'
import { getOpenTasks, isConnected } from '@/lib/dryp-crm'

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ connected: false, tasks: [] })
  }
  try {
    const tasks = await getOpenTasks(50)
    return NextResponse.json({ connected: true, tasks })
  } catch (err) {
    console.error('DRYP tasks error:', err)
    return NextResponse.json({ connected: false, tasks: [], error: String(err) }, { status: 500 })
  }
}
