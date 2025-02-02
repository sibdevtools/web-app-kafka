/**
 * Encode array buffer to base64
 * @param arrayBuffer array buffer
 */
export const encode = (arrayBuffer: ArrayBuffer): string => {
  return btoa(new Uint8Array(arrayBuffer).reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
  }, ''));
};

/**
 * Encode base64 to array buffer
 * @param base64 base64 text
 */
export const decodeToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

const textDecoder = new TextDecoder();
/**
 * Encode base64 to text
 * @param base64 base64 text
 */
export const decodeToText = (base64: string): string => {
  const buffer = decodeToBuffer(base64);
  return textDecoder.decode(buffer);
};
/**
 * Try to decode base64 to text
 * @param base64 base64 text
 */
export const tryDecodeToText = (base64: string | null): string => {
  if (!base64) {
    return ''
  }
  try {
    const buffer = decodeToBuffer(base64);
    return textDecoder.decode(buffer);
  } catch (error) {
    console.error('Failed to decode base64 to text:', error);
    return 'Not a valid base64 string';
  }
};


const encoder = new TextEncoder();

/**
 * Encode a string to base64
 * @param text The string to encode
 */
export const encodeText = (text: string): string => {
  const arrayBuffer = encoder.encode(text);
  return encode(arrayBuffer);
};
