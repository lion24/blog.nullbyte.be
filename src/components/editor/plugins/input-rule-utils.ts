import { type SlateEditor, KEYS } from 'platejs';

/** Input-rule guard: skip markdown shortcuts while typing inside a code block. */
export const notInCodeBlock = ({ editor }: { editor: SlateEditor }) =>
  !editor.api.some({ match: { type: editor.getType(KEYS.codeBlock) } });
