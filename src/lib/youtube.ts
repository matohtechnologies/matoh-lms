/**
 * Utility functions for YouTube URL parsing and thumbnail extraction.
 */

const YOUTUBE_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/)|(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/)([a-zA-Z0-9_-]{11})/i;

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

/**
 * Checks whether the given string is a direct video file (mp4, webm, ogg, mov).
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return VIDEO_EXTENSION_REGEX.test(url.trim());
}

/**
 * Extracts YouTube 11-character video ID from various YouTube URL formats or thumbnail URLs.
 */
export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(YOUTUBE_REGEX);
  return match && match[1] ? match[1] : null;
}

/**
 * Checks whether the given string is a YouTube URL or YouTube thumbnail URL.
 */
export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return YOUTUBE_REGEX.test(url.trim());
}

/**
 * Checks if the media URL is playable (YouTube video or direct video file).
 */
export function isPlayableMedia(url?: string | null): boolean {
  if (!url) return false;
  return isYouTubeUrl(url) || isVideoUrl(url);
}

/**
 * Gets an iframe embed URL for YouTube or returns null for non-YouTube.
 */
export function getEmbedUrl(url?: string | null, autoplay: boolean = true): string | null {
  if (!url) return null;
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  }
  return null;
}

/**
 * Generates YouTube thumbnail image URL from a video ID or URL.
 * Quality options:
 * - 'maxres': 1280x720 (may 404 on low-res uploads)
 * - 'hq': 480x360 (guaranteed to exist for all videos)
 * - 'mq': 320x180
 */
export function getYouTubeThumbnailUrl(
  urlOrId?: string | null,
  quality: "maxres" | "hq" | "mq" = "hq"
): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  const videoId =
    /^[a-zA-Z0-9_-]{11}$/.test(trimmed)
      ? trimmed
      : extractYouTubeVideoId(trimmed);

  if (!videoId) return null;

  const qualityFilename =
    quality === "maxres"
      ? "maxresdefault.jpg"
      : quality === "mq"
      ? "mqdefault.jpg"
      : "hqdefault.jpg";

  return `https://img.youtube.com/vi/${videoId}/${qualityFilename}`;
}

/**
 * Resolves thumbnail URL safely.
 * If given a YouTube video URL, automatically converts it into a valid YouTube image thumbnail URL.
 * If already an image or normal URL, returns it as is.
 */
export function resolveThumbnailUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If already a YouTube image host URL, keep it
  if (
    trimmed.includes("img.youtube.com/vi/") ||
    trimmed.includes("i.ytimg.com/vi/")
  ) {
    return trimmed;
  }

  // If it's a YouTube video URL, extract thumbnail
  const videoId = extractYouTubeVideoId(trimmed);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return trimmed;
}
