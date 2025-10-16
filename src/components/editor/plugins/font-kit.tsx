'use client';

import type { PlatePluginConfig } from 'platejs/react';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from '@platejs/basic-styles/react';
import { KEYS } from 'platejs';

const options = {
  inject: { targetPlugins: [KEYS.p] },
} satisfies PlatePluginConfig;

export const FontKit = [
  // Do not inject a default text color to avoid serializing inline color styles.
  // Users can still set an explicit color via the toolbar when needed.
  FontColorPlugin.configure(options),
  FontBackgroundColorPlugin.configure(options),
  FontSizePlugin.configure(options),
  FontFamilyPlugin.configure(options),
];
