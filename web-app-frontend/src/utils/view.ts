import { tryDecodeToText } from './base64';

export type ViewType = 'base64' | 'raw';

export const getViewRepresentation = (view: ViewType, value: string | null): string => {
  if (!value) {
    return ''
  }
  if (view === 'raw') {
    return tryDecodeToText(value)
  }

  return value;
}
