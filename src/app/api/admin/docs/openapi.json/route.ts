import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { createErrorResponse } from '@/lib/errors'

/**
 * GET /api/admin/docs/openapi.json
 * Serve the OpenAPI specification as JSON
 * Requires admin authentication
 */
export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin()

    const filePath = join(process.cwd(), 'docs', 'admin-api-openapi.yaml')
    const yamlContent = readFileSync(filePath, 'utf8')
    const openApiSpec = yaml.load(yamlContent)

    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    // Handle authentication errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    // Handle other errors
    console.error('Error loading OpenAPI spec:', error)
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    )
  }
}
