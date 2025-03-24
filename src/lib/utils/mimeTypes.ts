declare const mimeTypeSymbol: unique symbol;
export type MIMEType = string & { [mimeTypeSymbol]: true };

export const stringToMIMEType = (value: string): MIMEType => {
  return value as MIMEType;
};
export const MIMETypeToString = (value: MIMEType): string => {
  return value as string;
};

// MIME Type Constants (Expanded List)
// Application Types
export const APPLICATION_OCTET_STREAM = stringToMIMEType(
  "application/octet-stream",
);
export const APPLICATION_JSON = stringToMIMEType("application/json");
export const APPLICATION_PDF = stringToMIMEType("application/pdf");
export const APPLICATION_XML = stringToMIMEType("application/xml");
export const APPLICATION_ZIP = stringToMIMEType("application/zip");
export const APPLICATION_GZIP = stringToMIMEType("application/gzip");
export const APPLICATION_X_TAR = stringToMIMEType("application/x-tar");
export const APPLICATION_X_WWW_FORM_URLENCODED = stringToMIMEType(
  "application/x-www-form-urlencoded",
);
export const APPLICATION_JAVASCRIPT = stringToMIMEType(
  "application/javascript",
);
export const APPLICATION_MSWORD = stringToMIMEType("application/msword");
export const APPLICATION_VND_MS_EXCEL = stringToMIMEType(
  "application/vnd.ms-excel",
);
export const APPLICATION_VND_MS_POWERPOINT = stringToMIMEType(
  "application/vnd.ms-powerpoint",
);
export const APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT =
  stringToMIMEType(
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
export const APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET =
  stringToMIMEType(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
export const APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION =
  stringToMIMEType(
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  );
export const APPLICATION_RTF = stringToMIMEType("application/rtf");

export const AUDIO_AAC = stringToMIMEType("audio/aac");
export const AUDIO_MP3 = stringToMIMEType("audio/mp3"); // Alias for audio/mpeg
export const AUDIO_MPEG = stringToMIMEType("audio/mpeg");
export const AUDIO_OGG = stringToMIMEType("audio/ogg");
export const AUDIO_WAV = stringToMIMEType("audio/wav");
export const AUDIO_WEBM = stringToMIMEType("audio/webm");
export const AUDIO_FLAC = stringToMIMEType("audio/flac");
export const AUDIO_MIDI = stringToMIMEType("audio/midi");
export const AUDIO_X_AIFF = stringToMIMEType("audio/x-aiff");

export const IMAGE_GIF = stringToMIMEType("image/gif");
export const IMAGE_JPEG = stringToMIMEType("image/jpeg");
export const IMAGE_PNG = stringToMIMEType("image/png");
export const IMAGE_WEBP = stringToMIMEType("image/webp");
export const IMAGE_ICO = stringToMIMEType("image/x-icon");
export const IMAGE_BMP = stringToMIMEType("image/bmp");
export const IMAGE_TIFF = stringToMIMEType("image/tiff");
export const IMAGE_SVG_XML = stringToMIMEType("image/svg+xml");
export const IMAGE_HEIC = stringToMIMEType("image/heic");
export const IMAGE_HEIF = stringToMIMEType("image/heif");
export const IMAGE_AVIF = stringToMIMEType("image/avif");

export const TEXT_PLAIN = stringToMIMEType("text/plain");
export const TEXT_HTML = stringToMIMEType("text/html");
export const TEXT_CSS = stringToMIMEType("text/css");
export const TEXT_JAVASCRIPT = stringToMIMEType("text/javascript");
export const TEXT_CSV = stringToMIMEType("text/csv");
export const TEXT_XML = stringToMIMEType("text/xml");
export const LONG_MESSAGE = stringToMIMEType("text/x-signal-plain");
export const TEXT_ATTACHMENT = stringToMIMEType("text/x-signal-story");
export const TEXT_VCARD = stringToMIMEType("text/vcard");
export const TEXT_CALENDAR = stringToMIMEType("text/calendar");

export const VIDEO_MP4 = stringToMIMEType("video/mp4");
export const VIDEO_QUICKTIME = stringToMIMEType("video/quicktime");
export const VIDEO_MPEG = stringToMIMEType("video/mpeg");
export const VIDEO_OGG = stringToMIMEType("video/ogg");
export const VIDEO_WEBM = stringToMIMEType("video/webm");
export const VIDEO_3GPP = stringToMIMEType("video/3gpp");
export const VIDEO_AVI = stringToMIMEType("video/x-msvideo");
export const VIDEO_X_MSVIDEO = stringToMIMEType("video/x-msvideo"); // Alias for AVI
export const VIDEO_X_FLV = stringToMIMEType("video/x-flv");

export const MULTIPART_FORM_DATA = stringToMIMEType("multipart/form-data");
export const MULTIPART_MIXED = stringToMIMEType("multipart/mixed");
export const MULTIPART_RELATED = stringToMIMEType("multipart/related");

export const FONT_WOFF = stringToMIMEType("font/woff");
export const FONT_WOFF2 = stringToMIMEType("font/woff2");
export const FONT_TTF = stringToMIMEType("font/ttf");
export const FONT_OTF = stringToMIMEType("font/otf");

export const isHeic = (value: string, fileName: string): boolean =>
  value === "image/heic" ||
  value === "image/heif" ||
  fileName.toLowerCase().endsWith(".heic") ||
  fileName.toLowerCase().endsWith(".heif");

export const isGif = (value: string): value is MIMEType => value === IMAGE_GIF;
export const isJPEG = (value: string): value is MIMEType =>
  value === IMAGE_JPEG;
export const isImage = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("image/");
export const isVideo = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("video/");
export const isAudio = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("audio/") && !value.endsWith("aiff");
export const isLongMessage = (value: string): value is MIMEType =>
  value === LONG_MESSAGE;
export const supportsIncrementalMac = (value: string): boolean =>
  value === VIDEO_MP4;

export const isText = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("text/");
export const isApplication = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("application/");
export const isMultipart = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("multipart/");
export const isFont = (value: string): value is MIMEType =>
  Boolean(value) && value.startsWith("font/");
