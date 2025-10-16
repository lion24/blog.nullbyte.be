'use client';

import { CaptionPlugin } from '@platejs/caption/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@platejs/media/react';
import { KEYS } from 'platejs';

import { AudioElement } from '@/components/ui/media-audio-node';
import { MediaEmbedElement } from '@/components/ui/media-embed-node';
import { FileElement } from '@/components/ui/media-file-node';
import { ImageElement } from '@/components/ui/media-image-node';
import { PlaceholderElement } from '@/components/ui/media-placeholder-node';
import { MediaPreviewDialog } from '@/components/ui/media-preview-dialog';
import { MediaUploadToast } from '@/components/ui/media-upload-toast';
import { VideoElement } from '@/components/ui/media-video-node';

export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: {
      disableEmptyPlaceholder: true,
      uploadConfig: {
        image: {
          maxFileSize: '16MB', // Increased from default 4MB to support larger GIFs
          maxFileCount: 5,
          minFileCount: 1,
          mediaType: KEYS.img,
        },
        video: {
          maxFileSize: '64MB',
          maxFileCount: 1,
          minFileCount: 1,
          mediaType: KEYS.video,
        },
        audio: {
          maxFileSize: '16MB',
          maxFileCount: 1,
          minFileCount: 1,
          mediaType: KEYS.audio,
        },
        pdf: {
          maxFileSize: '16MB',
          maxFileCount: 1,
          minFileCount: 1,
          mediaType: KEYS.file,
        },
        text: {
          maxFileSize: '1MB',
          maxFileCount: 1,
          minFileCount: 1,
          mediaType: KEYS.file,
        },
        blob: {
          maxFileSize: '16MB',
          maxFileCount: 1,
          minFileCount: 1,
          mediaType: KEYS.file,
        },
      },
    },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
];
