import * as React from 'react';

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
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress tracking with XMLHttpRequest
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.min((e.loaded / e.total) * 100, 100);
            setProgress(percentComplete);
            onUploadProgress?.(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const result = await uploadPromise;

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

      // Mock upload fallback for development
      const mockUploadedFile: UploadedFile = {
        pathname: `mock/${file.name}`,
        name: file.name,
        size: file.size,
        contentType: file.type,
        url: URL.createObjectURL(file),
      };

      // Simulate upload progress
      let mockProgress = 0;

      const simulateProgress = async () => {
        while (mockProgress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          mockProgress += 2;
          const currentProgress = Math.min(mockProgress, 100);
          setProgress(currentProgress);
          onUploadProgress?.(currentProgress);
        }
      };

      await simulateProgress();

      setUploadedFile(mockUploadedFile);

      return mockUploadedFile;
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
