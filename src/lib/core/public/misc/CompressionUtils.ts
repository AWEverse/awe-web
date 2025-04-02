import Pako from "pako";
import BufferUtils from "./BufferUtils";

const COMPRESSION_LEVEL = 9;

export default {
  /**
   * Compress data with optimized settings
   */
  compress(data: string): string {
    try {
      const input = BufferUtils.stringToBuffer(data);
      const compressed = Pako.deflate(input, {
        level: COMPRESSION_LEVEL,
        memLevel: 9, // Use maximum memory for best compression
        strategy: 3, // Use Z_RLE strategy for animation data which often has repeated values
      });
      return BufferUtils.bufferToBase64(compressed);
    } catch (error) {
      console.error("Compression failed:", error);
      return BufferUtils.bufferToBase64(BufferUtils.stringToBuffer(data));
    }
  },

  /**
   * Decompress data with error handling
   */
  decompress(data: string): string {
    try {
      const buffer = BufferUtils.base64ToBuffer(data);
      const decompressed = Pako.inflate(buffer);
      return BufferUtils.bufferToString(decompressed);
    } catch (error) {
      console.error("Decompression failed:", error);
      throw new Error("Failed to decompress data: possibly corrupted");
    }
  }
};
