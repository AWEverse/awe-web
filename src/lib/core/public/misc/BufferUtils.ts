export default {
  /**
   * Convert string to Uint8Array more efficiently
   */
  stringToBuffer(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  },

  /**
   * Convert Uint8Array to string more efficiently
   */
  bufferToString(buffer: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  },

  /**
   * Convert binary data to base64 string for storage
   */
  bufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * Convert base64 string back to binary data
   */
  base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
};

