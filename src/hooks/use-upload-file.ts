import * as React from 'react';

import { upload } from '@vercel/blob/client';
import { toast } from 'sonner';
import { z } from 'zod';

export interface UploadedFile {
  url: string;
  pathname: string;
  contentType?: string;
  size: number;
  name: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadProgress?: (progress: number) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      // Client-side direct upload to Vercel Blob
      // This bypasses the 4.5MB serverless function limit
      // Files are uploaded directly from browser to Vercel Blob (supports up to 5TB)
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({
          originalName: file.name,
          size: file.size,
          type: file.type,
        }),
        onUploadProgress: ({ percentage }) => {
          setProgress(percentage);
          onUploadProgress?.(percentage);
        },
      });

      const result: UploadedFile = {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || file.type,
        size: file.size,
        name: file.name,
      };

      setUploadedFile(result);
      onUploadComplete?.(result);

      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(err);

      throw err; // Re-throw to prevent further processing
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });

    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
