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
 * Checks whether the given string is a YouTube VIDEO URL (watch, shorts, embed, youtu.be),
 * explicitly excluding static thumbnail image hosts (img.youtube.com, i.ytimg.com).
 */
export function isYouTubeVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.includes("img.youtube.com") || trimmed.includes("i.ytimg.com")) {
    return false;
  }
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i.test(trimmed);
}

/**
 * Checks whether the given string is a YouTube URL or YouTube thumbnail URL.
 */
export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return YOUTUBE_REGEX.test(url.trim());
}

/**
 * Checks if the media URL is a playable video (YouTube video or direct video file).
 */
export function isPlayableMedia(url?: string | null): boolean {
  if (!url) return false;
  return isYouTubeVideoUrl(url) || isVideoUrl(url);
}

/**
 * Alias for isPlayableMedia for explicit clarity.
 */
export function isPlayableVideo(url?: string | null): boolean {
  return isPlayableMedia(url);
}

/**
 * Checks if the given URL is a static image (uploaded file or image link),
 * rather than a playable video.
 */
export function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return !isPlayableVideo(trimmed);
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

/**
 * Extracts a Google Drive file ID from various URL patterns.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/file/d/{FILE_ID}/preview
 * - https://drive.google.com/file/d/{FILE_ID}/edit
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 */
export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const matchFile = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchFile && matchFile[1]) return matchFile[1];
  const matchOpen = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/i);
  if (matchOpen && matchOpen[1]) return matchOpen[1];
  return null;
}

/**
 * Checks whether the URL is a Google Drive file link.
 */
export function isGoogleDriveUrl(url?: string | null): boolean {
  return extractGoogleDriveFileId(url) !== null;
}

/**
 * Converts any Google Drive link to its official, iframe-embeddable preview URL.
 * e.g. https://drive.google.com/file/d/{id}/preview
 */
export function getGoogleDriveEmbedUrl(url?: string | null): string | null {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Checks whether the URL is a Google Docs document.
 */
export function isGoogleDocsUrl(url?: string | null): boolean {
  if (!url) return false;
  return /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i.test(url.trim());
}

/**
 * Converts a Google Docs document link to its embeddable preview URL.
 */
export function getGoogleDocsEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
  if (!match || !match[1]) return null;
  return `https://docs.google.com/document/d/${match[1]}/preview`;
}

/**
 * Converts Google Slides URL to its embed URL.
 */
export function getGoogleSlidesEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!isGoogleSlidesUrl(trimmed)) return null;
  return trimmed
    .replace(/\/pub(\?.*)?$/, "/embed?start=false&loop=false&delayms=3000")
    .replace(/\/edit(\?.*)?$/, "/embed?start=false&loop=false&delayms=3000");
}

/**
 * Checks whether the URL is a PDF file (by extension or PDF-serving path).
 */
export function isPdfUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /\.pdf(\?.*)?$/i.test(trimmed);
}

/**
 * Checks whether the URL is a PowerPoint presentation file (.ppt or .pptx).
 */
export function isPptUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(ppt|pptx)(\?.*)?$/i.test(url.trim());
}

/**
 * Checks whether the URL is an embeddable Google Slides presentation.
 */
export function isGoogleSlidesUrl(url?: string | null): boolean {
  if (!url) return false;
  return /docs\.google\.com\/presentation/i.test(url.trim());
}

/**
 * Checks whether the URL is an embeddable Canva presentation design.
 */
export function isCanvaPresentationUrl(url?: string | null): boolean {
  if (!url) return false;
  return /canva\.com\/design/i.test(url.trim());
}

/**
 * Checks whether the URL is any presentation (PowerPoint, Google Slides, Canva).
 */
export function isPresentationUrl(url?: string | null): boolean {
  return isPptUrl(url) || isGoogleSlidesUrl(url) || isCanvaPresentationUrl(url);
}

/**
 * Resolves the best embeddable URL for a PDF document or document viewer.
 * - Local files (/uploads/...) are embedded directly with `#toolbar=1`
 * - Google Drive files are embedded with `/preview`
 * - Google Docs are embedded with `/preview`
 * - Remote external PDFs use Google Docs Viewer proxy for 100% iframe compatibility
 */
export function getPdfEmbedUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (isGoogleDriveUrl(trimmed)) {
    return getGoogleDriveEmbedUrl(trimmed) || trimmed;
  }
  if (isGoogleDocsUrl(trimmed)) {
    return getGoogleDocsEmbedUrl(trimmed) || trimmed;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("blob:")) {
    return `${trimmed}#toolbar=1`;
  }
  // If already a Google Docs Viewer URL, keep it
  if (trimmed.includes("docs.google.com/viewer")) {
    return trimmed;
  }
  // For external remote HTTP/HTTPS PDF links, wrap with Google Docs Viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`;
}

/**
 * Detects the specific media kind for lessons.
 */
export type LessonMediaKind =
  | "youtube"
  | "video"
  | "pdf"
  | "google-drive"
  | "google-docs"
  | "google-slides"
  | "powerpoint"
  | "slides-embed"
  | "image"
  | "none";

export function getLessonMediaKind(url?: string | null): LessonMediaKind {
  if (!url || !url.trim()) return "none";
  const trimmed = url.trim();

  if (isYouTubeVideoUrl(trimmed)) return "youtube";
  if (isVideoUrl(trimmed)) return "video";
  if (isGoogleSlidesUrl(trimmed)) return "google-slides";
  if (isCanvaPresentationUrl(trimmed)) return "slides-embed";
  if (isGoogleDriveUrl(trimmed)) return "google-drive";
  if (isGoogleDocsUrl(trimmed)) return "google-docs";
  if (isPdfUrl(trimmed)) return "pdf";
  if (isPptUrl(trimmed)) return "powerpoint";
  if (/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(trimmed)) return "image";

  return "video";
}
