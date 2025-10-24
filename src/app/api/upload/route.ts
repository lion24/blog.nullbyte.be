import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

/**
 * Client-side direct upload to Vercel Blob
 *
 * This bypasses Vercel's 4.5MB serverless function body limit by:
 * 1. Client requests a secure upload token from this API route
 * 2. Client uploads file directly to Vercel Blob using the token
 * 3. Supports files up to 5TB
 *
 * The file never goes through the serverless function, only metadata does.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Generate secure token for client-side upload
        // This is where you can add authentication checks

        // Optional: Validate user session here
        // const session = await getServerSession(authOptions);
        // if (!session) throw new Error('Unauthorized');

        return {
          // Allowed MIME types for upload
          allowedContentTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/avif',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'audio/mpeg',
            'audio/wav',
            'audio/webm',
            'application/pdf',
            'text/plain',
          ],
          // Add random suffix to prevent filename collisions
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Called when upload completes successfully
        // This is where you can save metadata to your database
        console.log('Upload completed:', {
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
        });

        // Optional: Save to database
        // try {
        //   await prisma.upload.create({
        //     data: {
        //       url: blob.url,
        //       pathname: blob.pathname,
        //       size: blob.size,
        //       contentType: blob.contentType,
        //     },
        //   });
        // } catch (error) {
        //   console.error('Failed to save upload metadata:', error);
        // }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload failed' },
      { status: 400 }
    );
  }
}
