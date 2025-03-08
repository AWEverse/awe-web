import { useMemo } from "react";

interface MediaSource {
  src: string;
  type?: string;
  codecs?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

// Comprehensive MIME type mappings for all specified video formats
const VIDEO_TYPES: Record<string, string> = {
  mpeg: "video/mpeg",
  mp4: "video/mp4",
  ogg: "video/ogg",
  ogv: "video/ogg",
  mov: "video/quicktime",
  qt: "video/quicktime",
  webm: "video/webm",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  avi: "video/x-msvideo",
  "3gp": "video/3gpp",
  "3gpp": "video/3gpp",
  "3g2": "video/3gpp2",
  "3gpp2": "video/3gpp2",

  // Additional MIME types
  mkv: "video/webm", // Keeping original MIME type instead of video/webm
  f4v: "video/x-f4v",
  m4v: "video/x-m4v",
  h264: "video/h264",
  h265: "video/h265",
  divx: "video/divx",
  vob: "video/x-vob",
  anim: "video/x-anim",
  movie: "video/x-sgi-movie",
  asf: "video/x-ms-asf",
  ogm: "video/x-ogm",
  mjpeg: "video/x-mjpeg",
  rm: "video/x-pn-realvideo",

  // Streaming formats
  m3u8: "application/x-mpegURL",
  mpd: "application/dash+xml",
};

const parseMediaSources = (input: string | MediaSource[] | MediaSource) => {
  const mediaSources = useMemo(() => {
    if (!input) return null;

    const parseSource = (source: string | MediaSource): MediaSource => {
      if (typeof source === "string") {
        const [urlPart, params] = source.split(/[\[\]]/);
        const sourceObj: MediaSource = { src: urlPart.trim() };

        if (params) {
          params.split(";").forEach((param) => {
            const [key, value] = param.trim().split("=");
            if (key && value) {
              sourceObj[key] = value.replace(/['"]/g, "");
            }
          });
        }

        return sourceObj;
      }
      return { ...source };
    };

    const normalizeSources = (): MediaSource[] => {
      if (Array.isArray(input)) {
        return input.map(parseSource);
      }
      if (typeof input === "string") {
        return input.split(",").map((s) => parseSource(s.trim()));
      }
      return [parseSource(input)];
    };

    const sources = normalizeSources().map((source) => {
      const extensionMatch = source.src.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
      const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";

      const mimeType = source.type || VIDEO_TYPES[extension] || "";
      const isStreaming = [
        "application/x-mpegURL",
        "application/dash+xml",
      ].includes(mimeType);

      const typeParts = [mimeType];
      if (source.codecs) {
        typeParts.push(`codecs="${source.codecs}"`);
      }

      if (isStreaming && source.type?.includes("charset")) {
        typeParts.push('charset="UTF-8"');
      }

      const { width, height, src, type, codecs, ...rest } = source;

      return {
        src,
        type: typeParts.filter(Boolean).join("; "),
        ...rest,
      };
    });

    return sources.map(({ src, type, ...rest }) => (
      <source key={src} src={src} type={type || undefined} {...rest} />
    ));
  }, [input]);

  return mediaSources;
};

export default parseMediaSources;
