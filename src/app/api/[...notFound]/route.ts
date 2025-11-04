import { NextResponse } from 'next/server'

/**
 * Catch-all route for undefined API endpoints
 * 
 * This prevents API paths from being processed by the [locale] dynamic route,
 * which would cause:
 * 1. The locale route to treat "api" as a locale parameter
 * 2. Server Components to run and fetch data
 * 3. Data to be serialized in 404 page HTML
 * 
 * Instead, this returns a proper JSON 404 response.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}
