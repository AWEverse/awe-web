declare const MimeTypeSymbol: unique symbol;
export type MIMEType = string & { [MimeTypeSymbol]: true };

export const stringToMIMEType = (value: string): MIMEType => value as MIMEType;
export const MIMETypeToString = (value: MIMEType): string => value;

export const MIME_TYPES = Object.freeze({
  APPLICATION: Object.freeze({
    OCTET_STREAM: stringToMIMEType("application/octet-stream"),
    JSON: stringToMIMEType("application/json"),
    PDF: stringToMIMEType("application/pdf"),
    XML: stringToMIMEType("application/xml"),
    ZIP: stringToMIMEType("application/zip"),
    GZIP: stringToMIMEType("application/gzip"),
    X_TAR: stringToMIMEType("application/x-tar"),
    X_WWW_FORM_URLENCODED: stringToMIMEType(
      "application/x-www-form-urlencoded",
    ),
    JAVASCRIPT: stringToMIMEType("application/javascript"),
    MSWORD: stringToMIMEType("application/msword"),
    VND_MS_EXCEL: stringToMIMEType("application/vnd.ms-excel"),
    VND_MS_POWERPOINT: stringToMIMEType("application/vnd.ms-powerpoint"),
    VND_OPENXML_WORD: stringToMIMEType(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
    VND_OPENXML_SHEET: stringToMIMEType(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),
    VND_OPENXML_PRESENTATION: stringToMIMEType(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ),
    RTF: stringToMIMEType("application/rtf"),
  }),
  AUDIO: Object.freeze({
    AAC: stringToMIMEType("audio/aac"),
    MP3: stringToMIMEType("audio/mpeg"),
    OGG: stringToMIMEType("audio/ogg"),
    WAV: stringToMIMEType("audio/wav"),
    WEBM: stringToMIMEType("audio/webm"),
    FLAC: stringToMIMEType("audio/flac"),
    MIDI: stringToMIMEType("audio/midi"),
    X_AIFF: stringToMIMEType("audio/x-aiff"),
  }),
  IMAGE: Object.freeze({
    GIF: stringToMIMEType("image/gif"),
    JPEG: stringToMIMEType("image/jpeg"),
    PNG: stringToMIMEType("image/png"),
    WEBP: stringToMIMEType("image/webp"),
    ICO: stringToMIMEType("image/x-icon"),
    BMP: stringToMIMEType("image/bmp"),
    TIFF: stringToMIMEType("image/tiff"),
    SVG_XML: stringToMIMEType("image/svg+xml"),
    HEIC: stringToMIMEType("image/heic"),
    HEIF: stringToMIMEType("image/heif"),
    AVIF: stringToMIMEType("image/avif"),
  }),
  TEXT: Object.freeze({
    PLAIN: stringToMIMEType("text/plain"),
    HTML: stringToMIMEType("text/html"),
    CSS: stringToMIMEType("text/css"),
    JAVASCRIPT: stringToMIMEType("text/javascript"),
    CSV: stringToMIMEType("text/csv"),
    XML: stringToMIMEType("text/xml"),
    LONG_MESSAGE: stringToMIMEType("text/x-signal-plain"),
    ATTACHMENT: stringToMIMEType("text/x-signal-story"),
    VCARD: stringToMIMEType("text/vcard"),
    CALENDAR: stringToMIMEType("text/calendar"),
  }),
  VIDEO: Object.freeze({
    MP4: stringToMIMEType("video/mp4"),
    QUICKTIME: stringToMIMEType("video/quicktime"),
    MPEG: stringToMIMEType("video/mpeg"),
    OGG: stringToMIMEType("video/ogg"),
    WEBM: stringToMIMEType("video/webm"),
    _3GPP: stringToMIMEType("video/3gpp"),
    AVI: stringToMIMEType("video/x-msvideo"),
    X_FLV: stringToMIMEType("video/x-flv"),
  }),
  MULTIPART: Object.freeze({
    FORM_DATA: stringToMIMEType("multipart/form-data"),
    MIXED: stringToMIMEType("multipart/mixed"),
    RELATED: stringToMIMEType("multipart/related"),
  }),
  FONT: Object.freeze({
    WOFF: stringToMIMEType("font/woff"),
    WOFF2: stringToMIMEType("font/woff2"),
    TTF: stringToMIMEType("font/ttf"),
    OTF: stringToMIMEType("font/otf"),
  }),
});

export const isHeic = (value: string, fileName: string): boolean => {
  const lowerFileName = fileName.toLowerCase();
  return (
    value === MIME_TYPES.IMAGE.HEIC ||
    value === MIME_TYPES.IMAGE.HEIF ||
    lowerFileName.endsWith(".heic") ||
    lowerFileName.endsWith(".heif")
  );
};

export const isGif = (value: string): value is MIMEType =>
  value === MIME_TYPES.IMAGE.GIF;
export const isJPEG = (value: string): value is MIMEType =>
  value === MIME_TYPES.IMAGE.JPEG;
export const isImage = (value: string): value is MIMEType =>
  value.startsWith("image/");
export const isVideo = (value: string): value is MIMEType =>
  value.startsWith("video/");
export const isAudio = (value: string): value is MIMEType =>
  value.startsWith("audio/") && value !== MIME_TYPES.AUDIO.X_AIFF;
export const isLongMessage = (value: string): value is MIMEType =>
  value === MIME_TYPES.TEXT.LONG_MESSAGE;
export const supportsIncrementalMac = (value: string): boolean =>
  value === MIME_TYPES.VIDEO.MP4;
export const isText = (value: string): value is MIMEType =>
  value.startsWith("text/");
export const isApplication = (value: string): value is MIMEType =>
  value.startsWith("application/");
export const isMultipart = (value: string): value is MIMEType =>
  value.startsWith("multipart/");
export const isFont = (value: string): value is MIMEType =>
  value.startsWith("font/");
