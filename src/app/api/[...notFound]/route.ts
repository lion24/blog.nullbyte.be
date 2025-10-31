import { NextRequest, NextResponse } from 'next/server'

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
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  )
}
