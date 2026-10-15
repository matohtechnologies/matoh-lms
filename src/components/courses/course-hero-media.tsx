"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, BookOpen, Volume2 } from "lucide-react";
import {
  extractYouTubeVideoId,
  getEmbedUrl,
  isVideoUrl,
  isYouTubeVideoUrl,
  isPlayableVideo,
  isImageUrl,
  resolveThumbnailUrl,
} from "@/lib/youtube";

interface CourseHeroMediaProps {
  title: string;
  thumbnail?: string | null;
  trailerUrl?: string | null;
  fallbackLessonVideoUrl?: string | null;
}

export function CourseHeroMedia({
  title,
  thumbnail,
  trailerUrl,
  fallbackLessonVideoUrl,
}: CourseHeroMediaProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Condition: If thumbnail is an image (hardfile in /uploads or external image link),
  // DO NOT show play button. The play button should only be shown if media is explicitly a playable video.
  const isImageThumbnail = Boolean(thumbnail && isImageUrl(thumbnail));

  let videoSource: string | null = null;

  if (trailerUrl && isPlayableVideo(trailerUrl)) {
    videoSource = trailerUrl;
  } else if (thumbnail && isPlayableVideo(thumbnail)) {
    videoSource = thumbnail;
  } else if (!isImageThumbnail && fallbackLessonVideoUrl && isPlayableVideo(fallbackLessonVideoUrl)) {
    videoSource = fallbackLessonVideoUrl;
  }

  const isYouTube = videoSource ? isYouTubeVideoUrl(videoSource) : false;
  const isDirectVideo = videoSource ? isVideoUrl(videoSource) : false;
  const youtubeEmbedUrl = isYouTube ? getEmbedUrl(videoSource, true) : null;
  const isPlayable = Boolean(youtubeEmbedUrl || isDirectVideo);

  // Image poster
  const posterUrl = resolveThumbnailUrl(thumbnail);

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200/80 group">
      {isPlaying && isPlayable ? (
        <div className="w-full h-full relative bg-black">
          {/* Close / Return to poster button */}
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105"
            title="Tutup Pratinjau Video"
          >
            <X size={14} />
            <span>Tutup</span>
          </button>

          {isYouTube && youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isDirectVideo && videoSource ? (
            <video
              src={videoSource}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            >
              Browser Anda tidak mendukung tag video.
            </video>
          ) : null}
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Poster: image or direct video preview */}
          {posterUrl && !isVideoUrl(posterUrl) ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
              unoptimized={
                posterUrl.includes("youtube.com") ||
                posterUrl.includes("ytimg.com")
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : isVideoUrl(posterUrl || videoSource) ? (
            <video
              src={posterUrl || videoSource || ""}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
              <BookOpen size={60} className="text-blue-300" />
            </div>
          )}

          {/* Play button overlay: ONLY rendered when media is actually a playable video */}
          {isPlayable && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group/btn flex flex-col items-center gap-2.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 rounded-full"
                aria-label="Putar Video Pratinjau"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-blue-600 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:bg-blue-600 group-hover/btn:text-white">
                  {/* Subtle pulsing ripple rings */}
                  <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-40 pointer-events-none" />
                  <Play
                    size={28}
                    className="ml-1 transition-colors"
                    fill="currentColor"
                  />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-md shadow-sm tracking-wide">
                  Pratinjau Kelas Gratis
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
