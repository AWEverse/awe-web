import { useMemo } from "react";

interface MediaSource {
  src: string;
  type?: string;
  codecs?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

// Updated MIME type for mkv to video/webm for broader browser support.
const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  m3u8: "application/x-mpegURL",
  mpd: "application/dash+xml",
  mkv: "video/webm",
  mov: "video/quicktime",
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
      return source;
    };

    const normalizeSources = (): MediaSource[] => {
      if (Array.isArray(input)) {
        return input.map(parseSource);
      }
      if (typeof input === "string") {
        return input.split(",").map(parseSource);
      }
      return [parseSource(input)];
    };

    const sources = normalizeSources().map((source) => {
      const extension = source.src
        .split(/[#?]/)[0]
        .split(".")
        .pop()
        ?.toLowerCase();

      const mimeType = source.type || VIDEO_TYPES[extension || ""] || "";
      const isStreaming = [VIDEO_TYPES.m3u8, VIDEO_TYPES.mpd].includes(
        mimeType,
      );

      return {
        ...source,
        type: [
          mimeType,
          source.codecs && `codecs="${source.codecs}"`,
          isStreaming && 'charset="UTF-8"',
        ]
          .filter(Boolean)
          .join("; "),
      };
    });

    return sources.map(({ src, type, ...rest }) => (
      <source key={src} {...rest} src={src} type={type || undefined} />
    ));
  }, [input]);

  return mediaSources;
};

export default parseMediaSources;
