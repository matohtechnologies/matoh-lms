"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Check,
  Play,
  Award,
  List,
  X,
  FileText,
  HelpCircle,
  MessageSquare,
  FileCode2,
  Lock,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  RotateCcw,
  Upload,
  Download,
  Presentation,
  Paperclip,
  Bookmark,
  FolderDown,
  Trash2,
  Globe,
  Layers,
  ArrowDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { triggerCelebrationConfetti, triggerMicroConfetti } from "@/lib/confetti";
import { playPopSound, playSuccessChime, playFanfareSound } from "@/lib/sound-effects";
import { GraduationCelebrationModal } from "@/components/gamification/graduation-celebration-modal";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CustomPdfViewer } from "@/components/courses/custom-pdf-viewer";
import {
  isPdfUrl,
  isPptUrl,
  isGoogleSlidesUrl,
  isCanvaPresentationUrl,
  isGoogleDriveUrl,
  getGoogleDriveEmbedUrl,
  isGoogleDocsUrl,
  getGoogleDocsEmbedUrl,
  getGoogleSlidesEmbedUrl,
  isYouTubeVideoUrl,
  isVideoUrl,
} from "@/lib/youtube";

export interface LearnLesson {
  id: string;
  sectionId?: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  duration?: number;
  isFree?: boolean;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
}

export interface LearnSection {
  id: string;
  title: string;
  titleEn?: string | null;
  order: number;
  lessons: LearnLesson[];
}

export interface LearnCourseData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  instructor?: {
    id?: string;
    name?: string | null;
    image?: string | null;
    bio?: string | null;
  } | null;
  sections: LearnSection[];
}

interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
  order: number;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  createdAt: string;
}

interface Quiz {
  id: string;
  courseId: string;
  sectionId?: string | null;
  section?: {
    id: string;
    title: string;
    order?: number;
  } | null;
  title: string;
  description?: string | null;
  passingScore: number;
  questions: QuizQuestion[];
  attempts?: QuizAttempt[];
}

interface UserSubmission {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback?: string | null;
  score?: number | null;
  submittedAt: string;
  reviewedAt?: string | null;
}

interface Assignment {
  id: string;
  courseId: string;
  sectionId?: string | null;
  section?: {
    id: string;
    title: string;
    order?: number;
  } | null;
  title: string;
  description: string;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string;
  submissions?: UserSubmission[];
}

interface DiscussionUser {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: DiscussionUser;
}

interface Discussion {
  id: string;
  courseId: string;
  userId: string;
  content: string;
  lessonId?: string | null;
  createdAt: string;
  user: DiscussionUser;
  replies: DiscussionReply[];
}

interface StudyNoteItem {
  id: string;
  courseId: string;
  lessonId: string;
  timestamp: number;
  content: string;
  createdAt: string;
  lesson?: { id: string; title: string; order: number };
}

interface CourseResourceItem {
  id: string;
  courseId: string;
  sectionId?: string | null;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  type: string;
  createdAt: string;
  section?: {
    id: string;
    title: string;
    order?: number;
  } | null;
}

function getEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return trimmed;
}

interface LearnPageClientProps {
  courseId: string;
  initialCourse: LearnCourseData;
  initialCompletedLessonIds?: string[];
}

export default function LearnPageClient({
  courseId,
  initialCourse,
  initialCompletedLessonIds = [],
}: LearnPageClientProps) {
  const t = useTranslations("learn");
  const locale = useLocale();
  const course = initialCourse;

  // Extract sections and lessons
  const sections = course.sections ?? [];
  const allLessons: LearnLesson[] = sections.flatMap((s) => s.lessons ?? []);

  const defaultLesson: LearnLesson = allLessons[0] ?? {
    id: "default-lesson",
    title: "Materi Sedang Disiapkan",
    slug: "coming-soon",
    duration: 0,
    isFree: true,
    order: 1,
    sectionId: "none",
    content: "Instruktur sedang mempersiapkan materi pembelajaran untuk kelas ini.",
  };

  const initialLesson: LearnLesson =
    allLessons.find((l) => !initialCompletedLessonIds.includes(l.id)) ||
    allLessons[0] ||
    defaultLesson;

  const { data: session } = useSession();
  const [currentLesson, setCurrentLesson] = useState<LearnLesson>(initialLesson);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );
  const [savingProgress, setSavingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "notes" | "studyNotes" | "resources" | "quiz" | "assignment" | "discussion"
  >("notes");

  // Scroll completion requirement
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScrollToBottom = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Evaluate scroll requirement on lesson or tab change
  useEffect(() => {
    // If already completed, reading requirement is already satisfied
    if (completedLessons.has(currentLesson.id)) {
      setHasScrolledToBottom(true);
      return;
    }

    setHasScrolledToBottom(false);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      const el = mainScrollRef.current;
      if (el) {
        if (el.scrollHeight <= el.clientHeight + 60) {
          setHasScrolledToBottom(true);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [currentLesson.id, activeTab, completedLessons]);

  const handleMainScroll = useCallback(() => {
    if (hasScrolledToBottom) return;
    const el = mainScrollRef.current;
    if (!el) return;

    const threshold = 75; // px from bottom
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  useEffect(() => {
    // Open syllabus sidebar by default only on desktop screens (>= 1024px)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Tab scroll overflow state for responsive horizontal scroll navigation
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    checkTabScroll();
    window.addEventListener("resize", checkTabScroll);
    return () => window.removeEventListener("resize", checkTabScroll);
  }, [checkTabScroll]);

  // Dynamic Forensic Watermark State
  const [watermarkPos, setWatermarkPos] = useState({ x: 18, y: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setWatermarkPos({
        x: Math.floor(8 + Math.random() * 65),
        y: Math.floor(10 + Math.random() * 70),
      });
    }, 18000);
    return () => clearInterval(timer);
  }, []);

  // Screen Orientation Lock on Fullscreen (Rotates mobile screen to landscape on Android / supported devices)
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isFs) {
        if (
          typeof window !== "undefined" &&
          window.screen?.orientation &&
          typeof (window.screen.orientation as any).lock === "function"
        ) {
          try {
            await (window.screen.orientation as any).lock("landscape");
          } catch {
            // Silently ignore if not supported or rejected
          }
        }
      } else {
        if (
          typeof window !== "undefined" &&
          window.screen?.orientation &&
          typeof window.screen.orientation.unlock === "function"
        ) {
          try {
            window.screen.orientation.unlock();
          } catch { }
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      if (
        typeof window !== "undefined" &&
        window.screen?.orientation &&
        typeof window.screen.orientation.unlock === "function"
      ) {
        try {
          window.screen.orientation.unlock();
        } catch { }
      }
    };
  }, []);

  // In-Video Study Notes State
  const [studyNotes, setStudyNotes] = useState<StudyNoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTimestamp, setNewNoteTimestamp] = useState(0);
  const [savingNote, setSavingNote] = useState(false);

  // Course Resources State
  const [resources, setResources] = useState<CourseResourceItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceFilter, setResourceFilter] = useState<"CHAPTER" | "GENERAL">("CHAPTER");

  // Quizzes State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submissionUrlInput, setSubmissionUrlInput] = useState<Record<string, string>>({});
  const [submissionFileInput, setSubmissionFileInput] = useState<
    Record<string, { url: string; fileName: string; fileSize?: number }>
  >({});
  const [uploadingForAssignmentId, setUploadingForAssignmentId] = useState<string | null>(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);

  // Discussions State
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [newTopicText, setNewTopicText] = useState("");
  const [sendingTopic, setSendingTopic] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  // Gamification & Graduation Celebration State
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    courseTitle: string;
    studentName?: string;
    certificateCode?: string | null;
    certificateUrl?: string | null;
    score?: number | null;
    isQuizScore?: boolean;
  }>({
    isOpen: false,
    courseTitle: course.title,
  });

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const progress = Math.round((completedLessons.size / Math.max(1, allLessons.length)) * 100);

  // Reliable Active Section Resolution (matches sectionId or checks lessons array)
  const currentSection = sections.find(
    (s) =>
      (currentLesson?.sectionId && s.id === currentLesson.sectionId) ||
      s.lessons?.some((l) => l.id === currentLesson?.id)
  );
  const currentSectionId = currentSection?.id;

  // Chapter-Scoped & General Resources
  const currentChapterResources = currentSectionId
    ? resources.filter((r) => r.sectionId === currentSectionId)
    : [];
  const generalResources = resources.filter((r) => !r.sectionId);
  const relevantResourcesCount = currentChapterResources.length + generalResources.length;

  // Check if a section's required tests and submissions are completed
  const isSectionRequirementsMet = useCallback(
    (secId: string): boolean => {
      // 1. Quizzes: All quizzes belonging to this section must be passed
      const secQuizzes = quizzes.filter((q) => q.sectionId === secId);
      const allQuizzesPassed = secQuizzes.every((q) =>
        q.attempts?.some((att) => att.passed)
      );
      if (!allQuizzesPassed) return false;

      // 2. Assignments: All assignments belonging to this section must have a submission
      const secAssignments = assignments.filter((a) => a.sectionId === secId);
      const allAssignmentsSubmitted = secAssignments.every((a) =>
        a.submissions &&
        a.submissions.length > 0 &&
        a.submissions.some((s) => s.status === "APPROVED" || s.status === "PENDING")
      );
      if (!allAssignmentsSubmitted) return false;

      return true;
    },
    [quizzes, assignments]
  );

  // Check if a lesson is locked:
  // - First lesson (index 0) is never locked
  // - Any lesson already marked completed is unlocked
  // - A lesson is locked if any preceding lesson in the sequence is not yet completed
  // - A lesson is locked if any preceding section's tests/submissions are not yet completed
  const isLessonLocked = useCallback(
    (lessonId: string): boolean => {
      const targetIndex = allLessons.findIndex((l) => l.id === lessonId);
      if (targetIndex <= 0) return false;
      if (completedLessons.has(lessonId)) return false;

      // Rule 1: Every lesson before targetIndex must be marked completed
      for (let i = 0; i < targetIndex; i++) {
        if (!completedLessons.has(allLessons[i].id)) {
          return true;
        }
      }

      // Rule 2: If target lesson belongs to a different (subsequent) section,
      // all previous sections must have their tests/submissions completed!
      const targetLesson = allLessons[targetIndex];
      const targetSectionIndex = sections.findIndex(
        (s) =>
          (targetLesson.sectionId && s.id === targetLesson.sectionId) ||
          s.lessons?.some((l) => l.id === targetLesson.id)
      );

      if (targetSectionIndex > 0) {
        for (let sIdx = 0; sIdx < targetSectionIndex; sIdx++) {
          const prevSec = sections[sIdx];
          if (!isSectionRequirementsMet(prevSec.id)) {
            return true;
          }
        }
      }

      return false;
    },
    [allLessons, completedLessons, sections, isSectionRequirementsMet]
  );

  // Section Assessment Status for the Active Section
  const currentSecQuizzes = currentSectionId
    ? quizzes.filter((q) => q.sectionId === currentSectionId)
    : [];
  const unpassedSecQuizzes = currentSecQuizzes.filter(
    (q) => !q.attempts?.some((att) => att.passed)
  );

  const currentSecAssignments = currentSectionId
    ? assignments.filter((a) => a.sectionId === currentSectionId)
    : [];
  const unsubmittedSecAssignments = currentSecAssignments.filter(
    (a) =>
      !a.submissions?.some((s) => s.status === "APPROVED" || s.status === "PENDING")
  );

  const currentSectionLessons = currentSection?.lessons || [];
  const isCurrentSectionLessonsCompleted =
    currentSectionLessons.length > 0 &&
    currentSectionLessons.every((l) => completedLessons.has(l.id));

  // Determine if this section has pending tests/submissions required before moving to the next section
  const currentSecIdx = sections.findIndex((s) => s.id === currentSectionId);
  const nextSection =
    currentSecIdx !== -1 && currentSecIdx < sections.length - 1
      ? sections[currentSecIdx + 1]
      : null;

  const hasPendingChapterTests =
    isCurrentSectionLessonsCompleted &&
    nextSection !== null &&
    (unpassedSecQuizzes.length > 0 || unsubmittedSecAssignments.length > 0);

  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Certificate Status & Criteria State
  const [certStatus, setCertStatus] = useState<{
    isEnabled: boolean;
    isIssued: boolean;
    isEligible: boolean;
    certificate: { code: string; issuedAt: string } | null;
    setting?: {
      title: string;
      issuerName: string;
      minProgress: number;
      requireQuizPassed: boolean;
      requireAssignmentApproved: boolean;
    };
    criteria?: {
      progress: {
        current: number;
        required: number;
        completedLessons: number;
        totalLessons: number;
        met: boolean;
      };
      quizzes: {
        total: number;
        passed: number;
        required: boolean;
        met: boolean;
      };
      assignments: {
        total: number;
        approved: number;
        required: boolean;
        met: boolean;
      };
    };
  } | null>(null);
  const [claimingCert, setClaimingCert] = useState(false);

  const fetchCertStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/certificate-status`);
      if (res.ok) {
        const d = await res.json();
        setCertStatus(d);
      }
    } catch (e) {
      console.error("Failed to load certificate status", e);
    }
  }, [courseId]);

  const handleClaimCertificate = async () => {
    try {
      setClaimingCert(true);
      const res = await fetch(`/api/courses/${courseId}/certificates/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mengklaim sertifikat");
        return;
      }
      await fetchCertStatus();
      setCelebrationData({
        isOpen: true,
        courseTitle: course.title,
        studentName: session?.user?.name || undefined,
        certificateCode: data.certificate.certificateCode,
        certificateUrl: `/certificates/${data.certificate.certificateCode}`,
        isQuizScore: false,
      });
    } catch {
      alert("Terjadi kesalahan saat mengklaim sertifikat");
    } finally {
      setClaimingCert(false);
    }
  };

  // Fetch Quizzes
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      const res = await fetch(`/api/courses/${courseId}/quizzes`);
      if (res.ok) {
        const d = await res.json();
        const loadedQuizzes: Quiz[] = d.quizzes || [];
        setQuizzes(loadedQuizzes);

        // Restore attempt if exists
        const currentQuiz = loadedQuizzes[selectedQuizIdx];
        if (currentQuiz?.attempts && currentQuiz.attempts.length > 0) {
          const attempt = currentQuiz.attempts[0];
          setUserAnswers((attempt.answers as Record<string, number>) || {});
          setQuizSubmitted(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [courseId, selectedQuizIdx]);

  // Submit Quiz Permanently to Database
  const handleSubmitQuiz = async (quizId: string) => {
    try {
      setSubmittingQuiz(true);
      const res = await fetch(`/api/courses/${courseId}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menyimpan hasil kuis");
      }

      const { attempt } = await res.json();
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, attempts: [attempt] } : q))
      );
      setQuizSubmitted(true);
      fetchCertStatus();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("lesson-completed"));
      }

      if (attempt?.score === 100) {
        setCelebrationData({
          isOpen: true,
          courseTitle: course.title,
          studentName: session?.user?.name || undefined,
          score: 100,
          isQuizScore: true,
        });
      } else if (attempt?.passed) {
        playSuccessChime();
        triggerMicroConfetti();
      } else {
        playPopSound();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan hasil kuis");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Fetch Assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const res = await fetch(`/api/courses/${courseId}/assignments`);
      if (res.ok) {
        const d = await res.json();
        setAssignments(d.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  }, [courseId]);

  // Fetch Discussions
  const fetchDiscussions = useCallback(async () => {
    try {
      setLoadingDiscussions(true);
      const res = await fetch(`/api/courses/${courseId}/discussions`);
      if (res.ok) {
        const d = await res.json();
        setDiscussions(d.discussions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiscussions(false);
    }
  }, [courseId]);

  // Fetch Study Notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoadingNotes(true);
      const res = await fetch(`/api/courses/${courseId}/notes`);
      if (res.ok) {
        const d = await res.json();
        setStudyNotes(d.notes || []);
      }
    } catch (err) {
      console.error("Failed to load study notes", err);
    } finally {
      setLoadingNotes(false);
    }
  }, [courseId]);

  // Create Study Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      setSavingNote(true);
      const res = await fetch(`/api/courses/${courseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id !== "default-lesson" ? currentLesson.id : allLessons[0]?.id,
          timestamp: newNoteTimestamp,
          content: newNoteContent.trim(),
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setStudyNotes((prev) => [d.note, ...prev]);
        setNewNoteContent("");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan catatan");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan catatan");
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Study Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudyNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  // Export Notes to Markdown
  const handleExportNotes = () => {
    if (studyNotes.length === 0) return;
    const header = `# Catatan Belajar: ${course.title}\nOleh: ${session?.user?.name || "Pelajar"}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\n\n---\n\n`;
    const body = studyNotes
      .map((n) => {
        const mins = Math.floor(n.timestamp / 60);
        const secs = n.timestamp % 60;
        const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        return `### ${n.lesson?.title || "Materi"} [⏱️ ${timeStr}]\n\n${n.content}\n`;
      })
      .join("\n---\n\n");
    const blob = new Blob([header + body], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Catatan_${course.slug || "kursus"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fetch Course Resources
  const fetchResources = useCallback(async () => {
    try {
      setLoadingResources(true);
      const res = await fetch(`/api/courses/${courseId}/resources`);
      if (res.ok) {
        const d = await res.json();
        setResources(d.resources || []);
      }
    } catch (err) {
      console.error("Failed to load resources", err);
    } finally {
      setLoadingResources(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchQuizzes();
    fetchAssignments();
    fetchDiscussions();
    fetchCertStatus();
    fetchNotes();
    fetchResources();
  }, [fetchQuizzes, fetchAssignments, fetchDiscussions, fetchCertStatus, fetchNotes, fetchResources]);

  const toggleLessonComplete = async (targetLessonId?: string) => {
    const lessonId = targetLessonId || currentLesson.id;

    // Prevent completing a locked lesson
    if (isLessonLocked(lessonId)) {
      return;
    }

    const isCurrentlyCompleted = completedLessons.has(lessonId);

    // If attempting to complete current lesson, require scrolling to bottom first
    if (!isCurrentlyCompleted && lessonId === currentLesson.id && !hasScrolledToBottom) {
      handleScrollToBottom();
      return;
    }

    const newCompleted = !isCurrentlyCompleted;

    // Optimistically update completedLessons in state
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (newCompleted) {
        next.add(lessonId);
      } else {
        next.delete(lessonId);
      }
      return next;
    });

    if (newCompleted) {
      playPopSound();
      triggerMicroConfetti();
    }

    try {
      setSavingProgress(true);
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId: course.id,
          completed: newCompleted,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setCompletedLessons((prev) => {
          const next = new Set(prev);
          if (isCurrentlyCompleted) next.add(lessonId);
          else next.delete(lessonId);
          return next;
        });
      } else {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("lesson-completed"));
        }
        // Immediately synchronize certificate status with DB
        await fetchCertStatus();

        // Check if user completed the final lesson
        const nextCount = completedLessons.size + (newCompleted ? 1 : 0);
        if (newCompleted && nextCount >= allLessons.length && allLessons.length > 0) {
          triggerCelebrationConfetti();
          playFanfareSound();
          setCelebrationData({
            isOpen: true,
            courseTitle: course.title,
            studentName: session?.user?.name || undefined,
            certificateCode: certStatus?.certificate?.code || null,
            certificateUrl: certStatus?.certificate?.code
              ? `/certificates/${certStatus.certificate.code}`
              : null,
            isQuizScore: false,
          });
        }
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
      // Revert on error
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (isCurrentlyCompleted) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });
    } finally {
      setSavingProgress(false);
    }

    // If marked as completed on current lesson and there is a next lesson, advance to next if unlocked
    if (newCompleted && lessonId === currentLesson.id && nextLesson) {
      if (!isLessonLocked(nextLesson.id)) {
        setCurrentLesson(nextLesson);
      }
    }
  };

  const markComplete = () => toggleLessonComplete();

  // Upload Student Submission File
  const handleStudentFileUpload = async (
    assignmentId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingForAssignmentId(assignmentId);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "submissions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal mengunggah file");
      }

      const data = await res.json();
      setSubmissionFileInput((prev) => ({
        ...prev,
        [assignmentId]: {
          url: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize,
        },
      }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setUploadingForAssignmentId(null);
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async (assignmentId: string) => {
    const content = submissionUrlInput[assignmentId]?.trim() || "";
    const fileData = submissionFileInput[assignmentId];

    if (!content && !fileData?.url) {
      alert("Masukkan tautan URL proyek atau unggah berkas file tugas Anda.");
      return;
    }

    try {
      setSubmittingAssignmentId(assignmentId);
      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignmentId}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            fileUrl: fileData?.url,
            fileName: fileData?.fileName,
            fileSize: fileData?.fileSize,
          }),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal mengirim tugas");
      }

      await fetchAssignments();
      fetchCertStatus();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("lesson-completed"));
      }
      playSuccessChime();
      triggerMicroConfetti();
      setSubmissionUrlInput((prev) => ({ ...prev, [assignmentId]: "" }));
      setSubmissionFileInput((prev) => {
        const updated = { ...prev };
        delete updated[assignmentId];
        return updated;
      });
      alert("Tugas berhasil dikirim! Menunggu evaluasi instruktur.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengirim tugas");
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  // Post Discussion
  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicText.trim()) return;

    try {
      setSendingTopic(true);
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newTopicText.trim(),
          lessonId: currentLesson.id !== "default-lesson" ? currentLesson.id : undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal membuat pertanyaan");
      }

      const { discussion } = await res.json();
      setDiscussions((prev) => [discussion, ...prev]);
      setNewTopicText("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengirim pertanyaan");
    } finally {
      setSendingTopic(false);
    }
  };

  // Send Reply
  const handleSendReply = async (discussionId: string) => {
    const text = replyTexts[discussionId]?.trim();
    if (!text) return;

    try {
      setSendingReplyId(discussionId);
      const res = await fetch(
        `/api/courses/${courseId}/discussions/${discussionId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal membalas");
      }

      const { reply } = await res.json();
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, replies: [...d.replies, reply] }
            : d
        )
      );

      setReplyTexts((prev) => ({ ...prev, [discussionId]: "" }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal membalas");
    } finally {
      setSendingReplyId(null);
    }
  };

  return (
    <div className="relative flex h-screen h-[100dvh] bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Lessons Navigation (Responsive Drawer on Mobile, In-Flow on Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] sm:max-w-xs bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-xs lg:static lg:inset-auto lg:h-full lg:z-20 overflow-hidden ${sidebarOpen
          ? "translate-x-0 lg:w-80 opacity-100 visible"
          : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 opacity-0 pointer-events-none invisible"
          }`}
      >
        <div className="w-80 min-w-[20rem] flex flex-col h-full shrink-0">
          {/* Brand & Course Title */}
          <div className="p-4 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:border-slate-300 transition-colors">
                  <Image
                    src="/images/matoh-logo-v2.png"
                    alt="Matoh Technologies"
                    width={18}
                    height={18}
                    priority
                    style={{ aspectRatio: "1 / 1" }}
                    className="object-contain aspect-square"
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  Matoh<span className="text-teal-400">Technologies</span>
                </span>
              </Link>
              {/* Dedicated Mobile Close Button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Tutup Menu Kurikulum"
              >
                <X size={18} />
              </button>
            </div>
            <h2 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2" title={course.title}>
              {course.title}
            </h2>
            <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>{t("progress")}</span>
                <span className="text-blue-500 font-bold">{t("done_pct", { pct: progress })}</span>
              </div>
              <Progress value={progress} size="sm" />
            </div>
          </div>

          {/* Sections & Lessons Playlist */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {sections.map((section) => {
              const secResources = resources.filter((r) => r.sectionId === section.id);
              const secLessons = section.lessons || [];
              const isSecCompleted = secLessons.length > 0 && secLessons.every((l) => completedLessons.has(l.id));
              const completedSecCount = secLessons.filter((l) => completedLessons.has(l.id)).length;
              const secQuizzes = quizzes.filter((q) => q.sectionId === section.id);
              const secAssignments = assignments.filter((a) => a.sectionId === section.id);
              return (
                <details
                  key={section.id}
                  open
                  className="group rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs"
                >
                  <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 bg-slate-50/60 list-none select-none transition-colors">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {section.title}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="divide-y divide-slate-100">
                    {section.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;
                      const isCompleted = completedLessons.has(lesson.id);
                      const isLocked = isLessonLocked(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all ${isActive
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : isLocked
                              ? "text-slate-400 bg-slate-50/40 border-l-2 border-transparent"
                              : "hover:bg-slate-50 text-slate-700 border-l-2 border-transparent"
                            }`}
                        >
                          {isLocked ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                              title="Terkunci: Selesaikan materi sebelumnya terlebih dahulu"
                            >
                              <Lock size={10} />
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                                ? "bg-green-600 text-white"
                                : isActive
                                  ? "border-2 border-blue-600 text-blue-600 bg-white"
                                  : "border border-slate-300 text-slate-400 bg-white"
                                }`}
                              title={
                                isCompleted
                                  ? "Materi telah selesai"
                                  : "Materi belum selesai"
                              }
                            >
                              {isCompleted ? <CheckCircle size={12} /> : <Play size={8} />}
                            </div>
                          )}
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => {
                              if (isLocked) return;
                              setCurrentLesson(lesson);
                              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                                setSidebarOpen(false);
                              }
                            }}
                            className={`text-xs truncate flex-1 text-left transition-colors py-1 flex items-center justify-between ${isLocked
                              ? "text-slate-400 cursor-not-allowed select-none"
                              : "hover:text-blue-600 text-slate-700"
                              }`}
                            title={isLocked ? "Terkunci: Selesaikan materi sebelumnya terlebih dahulu" : lesson.title}
                          >
                            <span className="truncate">{lesson.title}</span>
                            {isLocked && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 ml-1.5 font-normal">
                                <Lock size={11} className="opacity-70" />
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {/* Specific Learning Materials for this Section */}
                    {secResources.length > 0 && (
                      <div className="p-2.5 bg-slate-50/70 border-t border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <FolderDown size={12} />
                            <span>Bahan Bab Ini ({secResources.length})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("resources");
                              setResourceFilter("CHAPTER");
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Buka Tab &rarr;
                          </button>
                        </div>
                        <div className="space-y-1">
                          {secResources.map((res) => (
                            <a
                              key={res.id}
                              href={res.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition-colors group"
                              title={res.title}
                            >
                              <span className="truncate flex items-center gap-1.5">
                                <Paperclip size={11} className="text-slate-400 group-hover:text-blue-400 shrink-0" />
                                <span className="truncate">{res.title}</span>
                              </span>
                              <Download size={11} className="text-slate-400 group-hover:text-blue-400 shrink-0 ml-1.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quizzes specifically for this section */}
                    {secQuizzes.length > 0 && (
                      <div className="p-2.5 bg-slate-50/70 border-t border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <HelpCircle size={12} />
                            <span>Tes Bab Ini ({secQuizzes.length})</span>
                          </span>
                          {!isSecCompleted && (
                            <span className="text-[10px] text-amber-500/90 font-medium flex items-center gap-1">
                              <Lock size={10} /> Terkunci
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {secQuizzes.map((q) => {
                            const latestAttempt = q.attempts?.[0];
                            const passed = latestAttempt?.passed;
                            const qGlobalIdx = quizzes.findIndex((item) => item.id === q.id);

                            return (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => {
                                  if (qGlobalIdx !== -1) setSelectedQuizIdx(qGlobalIdx);
                                  setActiveTab("quiz");
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors group ${isSecCompleted
                                  ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
                                  : "bg-slate-100/50 border-slate-200/50 text-slate-400 hover:bg-slate-100"
                                  }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSecCompleted ? (
                                    passed ? (
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                    ) : (
                                      <HelpCircle size={13} className="text-amber-400 shrink-0" />
                                    )
                                  ) : (
                                    <Lock size={13} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate font-medium">{q.title}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${!isSecCompleted
                                    ? "bg-slate-100 text-slate-400"
                                    : passed
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-amber-500/20 text-amber-300"
                                    }`}
                                >
                                  {!isSecCompleted
                                    ? `${completedSecCount}/${secLessons.length}`
                                    : passed
                                      ? "Lulus"
                                      : "Kerjakan"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assignments specifically for this section */}
                    {secAssignments.length > 0 && (
                      <div className="p-2.5 bg-slate-50/70 border-t border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <FileCode2 size={12} />
                            <span>Tugas Bab Ini ({secAssignments.length})</span>
                          </span>
                          {!isSecCompleted && (
                            <span className="text-[10px] text-amber-500/90 font-medium flex items-center gap-1">
                              <Lock size={10} /> Terkunci
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {secAssignments.map((a) => {
                            const sub = a.submissions?.[0];
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab("assignment");
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors group ${isSecCompleted
                                  ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:text-slate-900"
                                  : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50/60"
                                  }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSecCompleted ? (
                                    sub?.status === "APPROVED" ? (
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                    ) : (
                                      <FileCode2 size={13} className="text-indigo-400 shrink-0" />
                                    )
                                  ) : (
                                    <Lock size={13} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate font-medium">{a.title}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${!isSecCompleted
                                    ? "bg-slate-100 text-slate-400"
                                    : sub?.status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : sub?.status === "PENDING"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-indigo-500/20 text-indigo-300"
                                    }`}
                                >
                                  {!isSecCompleted
                                    ? `${completedSecCount}/${secLessons.length}`
                                    : sub?.status === "APPROVED"
                                      ? "Disetujui"
                                      : sub?.status === "PENDING"
                                        ? "Menunggu"
                                        : "Kerjakan"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}

            {/* General Course Materials in Sidebar */}
            {generalResources.length > 0 && (
              <details
                open
                className="group rounded-xl border border-slate-200/70 overflow-hidden bg-slate-50/60"
              >
                <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-100/60 list-none select-none transition-colors">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} />
                    Bahan Belajar Umum ({generalResources.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("resources");
                        setResourceFilter("GENERAL");
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Buka Tab &rarr;
                    </button>
                    <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
                  </div>
                </summary>
                <div className="p-2 space-y-1 bg-slate-50/70">
                  {generalResources.map((res) => (
                    <a
                      key={res.id}
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition-colors group"
                      title={res.title}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <Paperclip size={11} className="text-slate-400 group-hover:text-emerald-400 shrink-0" />
                        <span className="truncate">{res.title}</span>
                      </span>
                      <Download size={11} className="text-slate-400 group-hover:text-emerald-400 shrink-0 ml-1.5" />
                    </a>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Certificate Section at Sidebar Bottom */}
          <div className="p-4 border-t border-slate-200 bg-white">
            {certStatus?.isEnabled === false ? (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[11px] text-center">
                {t("cert_not_enabled")}
              </div>
            ) : certStatus?.isIssued ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <Award size={18} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-300">{t("cert_issued_title")}</p>
                    <p className="text-[10px] text-emerald-400/80 font-mono truncate">
                      #{certStatus.certificate?.code}
                    </p>
                  </div>
                </div>
                <a
                  href={`/certificates/${certStatus.certificate?.code || course.slug || course.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <ExternalLink size={14} />
                  <span>{t("cert_view")}</span>
                </a>
              </div>
            ) : certStatus?.isEligible ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-start gap-2">
                  <Sparkles size={17} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-200">{t("cert_eligible_title")}</p>
                    <p className="text-[10px] text-amber-300/80 leading-tight mt-0.5">
                      {t("cert_eligible_desc")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClaimCertificate}
                  disabled={claimingCert}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-blue-950/40 transition-all animate-pulse disabled:opacity-50"
                >
                  {claimingCert ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                  <span>{t("cert_claim")}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Lock size={13} className="text-amber-500" />
                      <span>{t("cert_locked")}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-400">
                      {progress}%
                    </span>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-200 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">
                        • {t("criteria_material", { done: completedLessons.size, total: allLessons.length })}
                      </span>
                      {(certStatus?.criteria?.progress?.met ?? false) ||
                        progress >= (certStatus?.criteria?.progress?.required ?? 100) ? (
                        <span className="text-green-400 flex items-center gap-0.5 font-semibold">
                          <Check size={11} /> {t("criteria_done")}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {t("criteria_min", { pct: certStatus?.criteria?.progress?.required ?? 100 })}
                        </span>
                      )}
                    </div>

                    {certStatus?.criteria?.quizzes?.required &&
                      (certStatus.criteria.quizzes.total > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">
                            • {t("criteria_quiz", { passed: certStatus.criteria.quizzes.passed, total: certStatus.criteria.quizzes.total })}
                          </span>
                          {certStatus.criteria.quizzes.met ? (
                            <span className="text-green-400 flex items-center gap-0.5 font-semibold">
                              <Check size={11} /> {t("criteria_passed")}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold">{t("criteria_not_passed")}</span>
                          )}
                        </div>
                      ) : null)}

                    {certStatus?.criteria?.assignments?.required &&
                      (certStatus.criteria.assignments.total > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">
                            • {t("criteria_assignment", { approved: certStatus.criteria.assignments.approved, total: certStatus.criteria.assignments.total })}
                          </span>
                          {certStatus.criteria.assignments.met ? (
                            <span className="text-green-400 flex items-center gap-0.5 font-semibold">
                              <Check size={11} /> {t("criteria_approved")}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold">{t("criteria_needs_review")}</span>
                          )}
                        </div>
                      ) : null)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Learning Classroom Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-10 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors shrink-0"
              title={sidebarOpen ? t("close_syllabus") : t("open_syllabus")}
              aria-label="Toggle Kurikulum"
            >
              {sidebarOpen ? <X size={18} /> : <List size={18} />}
            </button>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {currentLesson.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/dashboard/my-courses"
              className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors inline-flex items-center gap-1 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 border border-slate-200 sm:border-transparent"
            >
              <ChevronLeft size={15} />
              <span className="hidden sm:inline">{t("back_to_dashboard")}</span>
              <span className="sm:hidden font-semibold">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Stage: Video + Tabbed Content */}
        <div
          ref={mainScrollRef}
          onScroll={handleMainScroll}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {/* Media Player Stage: Video, PDF Document, or PowerPoint Presentation */}
          {Boolean(currentLesson.videoUrl?.trim()) && (() => {
            const mediaUrl = currentLesson.videoUrl!.trim();
            const isPdf = isPdfUrl(mediaUrl);
            const isPpt = isPptUrl(mediaUrl);
            const isGoogleDrive = isGoogleDriveUrl(mediaUrl);
            const isGoogleDocs = isGoogleDocsUrl(mediaUrl);
            const isSlideEmbed = isGoogleSlidesUrl(mediaUrl) || isCanvaPresentationUrl(mediaUrl);
            const isYouTube = isYouTubeVideoUrl(mediaUrl);
            const isDirectVideo = isVideoUrl(mediaUrl) || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl);

            // 1. Google Drive Shared Document / PDF / Presentation Reader
            if (isGoogleDrive) {
              const driveEmbedUrl = getGoogleDriveEmbedUrl(mediaUrl);
              return (
                <div className="w-full bg-slate-900 flex flex-col h-[520px] sm:h-[620px] border-b border-slate-800 shadow-2xl">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-white">
                    <span className="font-semibold flex items-center gap-1.5 truncate">
                      <FileText size={15} className="text-blue-400 shrink-0" />
                      <span className="truncate">{currentLesson.title} — Google Drive Viewer</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                        title="Buka dokumen di Google Drive"
                      >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">Buka Dokumen Asli</span>
                      </a>
                    </div>
                  </div>
                  <iframe
                    src={driveEmbedUrl || mediaUrl}
                    className="w-full flex-1 border-0"
                    allow="autoplay"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                </div>
              );
            }

            // 2. Google Docs Embed
            if (isGoogleDocs) {
              const docsEmbedUrl = getGoogleDocsEmbedUrl(mediaUrl);
              return (
                <div className="w-full bg-slate-100 flex flex-col h-[520px] sm:h-[620px] border-b border-slate-200 shadow-2xl">
                  <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                      <FileText size={15} className="text-blue-600 shrink-0" />
                      <span className="truncate">{currentLesson.title} — Dokumen Google Docs</span>
                    </span>
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden sm:inline">Buka Tab Baru</span>
                    </a>
                  </div>
                  <iframe
                    src={docsEmbedUrl || mediaUrl}
                    className="w-full flex-1 border-0"
                    allow="autoplay"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                </div>
              );
            }

            // 3. Custom Canvas PDF Document Reader (Interactive Zoom, Page Navigation, Fullscreen & Anti-Download Protection)
            if (isPdf) {
              return (
                <div className="w-full">
                  <CustomPdfViewer
                    url={mediaUrl}
                    title={currentLesson.title}
                    userIdentifier={session?.user?.email || session?.user?.name || "Peserta Matoh Technologies"}
                  />
                </div>
              );
            }

            // 4. PowerPoint Presentation (.ppt / .pptx)
            if (isPpt) {
              const isRemoteHttp = mediaUrl.startsWith("http") && !mediaUrl.includes("localhost");
              const officeEmbedUrl = isRemoteHttp
                ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(mediaUrl)}`
                : null;

              if (officeEmbedUrl) {
                return (
                  <div className="w-full bg-slate-900 flex flex-col h-[520px] sm:h-[600px] border-b border-slate-800 shadow-2xl">
                    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-white">
                      <span className="font-semibold flex items-center gap-1.5 truncate">
                        <Presentation size={15} className="text-orange-400 shrink-0" />
                        <span className="truncate">{currentLesson.title} — Slide PowerPoint (PPTX)</span>
                      </span>
                      <a
                        href={mediaUrl}
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
                      >
                        <Download size={13} /> Unduh PPTX
                      </a>
                    </div>
                    <iframe
                      src={officeEmbedUrl}
                      className="w-full flex-1 border-0"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  </div>
                );
              }

              return (
                <div className="w-full bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-b border-orange-200/50 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3.5">
                    <Presentation size={32} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 max-w-lg">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
                    Materi presentasi PowerPoint telah disiapkan untuk sesi pembelajaran ini. Anda dapat mengunduh dan membukanya di aplikasi PowerPoint atau Google Slides.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <a
                      href={mediaUrl}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition-all hover:scale-105"
                    >
                      <Download size={14} /> Unduh Slide Presentasi (.pptx)
                    </a>
                  </div>
                </div>
              );
            }

            // 5. Google Slides / Canva Presentation Embed
            if (isSlideEmbed) {
              const embedSrc = isGoogleSlidesUrl(mediaUrl)
                ? getGoogleSlidesEmbedUrl(mediaUrl) || mediaUrl
                : mediaUrl;
              return (
                <div className="w-full bg-black flex items-center justify-center aspect-video max-h-[520px] shadow-2xl">
                  <iframe
                    src={embedSrc}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                </div>
              );
            }

            // 6. Direct Video File (Uploaded MP4/WebM or direct link)
            if (isDirectVideo) {
              return (
                <div className="w-full bg-black flex items-center justify-center relative aspect-video max-h-[520px] shadow-2xl">
                  {session?.user && (
                    <div
                      className="absolute pointer-events-none select-none z-20 text-[10px] font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-white/30 backdrop-blur-2xs transition-all duration-1000 ease-in-out border border-white/5"
                      style={{
                        top: `${watermarkPos.y}%`,
                        left: `${watermarkPos.x}%`,
                      }}
                    >
                      🔒 {session.user.email || session.user.name} • Matoh Technologies
                    </div>
                  )}
                  <video
                    src={mediaUrl}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }

            // 7. Video Player (YouTube or iframe embed)
            const ytEmbedUrl = isYouTube ? getEmbedUrl(mediaUrl) : null;
            return (
              <div className="w-full bg-black flex items-center justify-center relative aspect-video max-h-[520px] shadow-2xl">
                {/* Dynamic Forensic Watermark for Anti-Piracy */}
                {session?.user && (
                  <div
                    className="absolute pointer-events-none select-none z-20 text-[10px] font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-white/30 backdrop-blur-2xs transition-all duration-1000 ease-in-out border border-white/5"
                    style={{
                      top: `${watermarkPos.y}%`,
                      left: `${watermarkPos.x}%`,
                    }}
                  >
                    🔒 {session.user.email || session.user.name} • Matoh Technologies
                  </div>
                )}

                <iframe
                  src={ytEmbedUrl || mediaUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={currentLesson.title}
                />
              </div>
            );
          })()}

          {/* Interactive Navigation Bar below player */}
          <div className="bg-white border-y border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-2xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
              disabled={!prevLesson}
              leftIcon={<ChevronLeft size={16} />}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-2xs min-h-[42px] px-3 sm:px-4 text-xs font-semibold"
            >
              <span className="hidden xs:inline">{t("prev")}</span>
              <span className="xs:hidden">Prev</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => nextLesson && !isLessonLocked(nextLesson.id) && setCurrentLesson(nextLesson)}
              disabled={!nextLesson || isLessonLocked(nextLesson.id)}
              rightIcon={
                nextLesson && isLessonLocked(nextLesson.id) ? (
                  <Lock size={14} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} />
                )
              }
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-2xs min-h-[42px] px-3 sm:px-4 text-xs font-semibold"
              title={
                nextLesson && isLessonLocked(nextLesson.id)
                  ? "Materi selanjutnya terkunci sampai materi ini selesai"
                  : undefined
              }
            >
              <span className="hidden xs:inline">{t("next")}</span>
              <span className="xs:hidden">Next</span>
            </Button>
          </div>

          {/* Dicoding-style Tabs: Notes, Study Notes, Resources, Quiz, Assignments, Discussion */}
          <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 w-full">
            {/* Horizontal Scrollable Tab Bar with overflow arrows and indicators */}
            <div className="relative border-b border-slate-200 mb-5 sm:mb-6">
              {/* Left Scroll Navigation button if overflowed */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-6 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => tabScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                    aria-label="Scroll tabs left"
                    className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-md border border-slate-200 transition-all hover:scale-105"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}

              {/* Scrollable container */}
              <div
                ref={tabScrollRef}
                onScroll={checkTabScroll}
                className="flex items-center gap-1 sm:gap-2 lg:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 touch-pan-x"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  {
                    key: "notes",
                    label: t("tab_notes"),
                    icon: FileText,
                    count: null,
                  },
                  {
                    key: "studyNotes",
                    label: locale === "en" ? "Notes" : "Catatan",
                    icon: Bookmark,
                    count: studyNotes.length,
                  },
                  {
                    key: "resources",
                    label: locale === "en" ? "Resources" : "Bahan Belajar",
                    icon: FolderDown,
                    count: relevantResourcesCount,
                  },
                  {
                    key: "assignment",
                    label: locale === "en" ? "Assignments & Submission" : "Tugas & Submission",
                    icon: FileCode2,
                    count: assignments.length,
                  },
                  {
                    key: "quiz",
                    label: locale === "en" ? "Test" : "Tes",
                    icon: HelpCircle,
                    count: quizzes.length,
                  },
                  {
                    key: "discussion",
                    label: locale === "en" ? "Discussion" : "Forum Diskusi",
                    icon: MessageSquare,
                    count: discussions.length,
                  },
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key as typeof activeTab);
                    }}
                    className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 group ${activeTab === key
                      ? "text-blue-600 border-blue-600 font-semibold"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                      }`}
                  >
                    <Icon
                      size={16}
                      className={
                        activeTab === key
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-700 transition-colors"
                      }
                    />
                    <span>{label}</span>
                    {typeof count === "number" && (
                      <span
                        className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded-full transition-colors ${activeTab === key
                          ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                          : "bg-slate-100 text-slate-600 border border-slate-200 group-hover:text-slate-800"
                          }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Right Scroll Navigation button if overflowed */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-6 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => tabScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                    aria-label="Scroll tabs right"
                    className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-md border border-slate-200 transition-all hover:scale-105"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: NOTES & LESSON CONTENT */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">{currentLesson.title}</h2>
                {currentLesson.content ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 text-sm text-slate-800 leading-relaxed shadow-sm">
                    <MarkdownRenderer content={currentLesson.content} dark={false} />
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
                    {t("no_notes")}
                  </div>
                )}

                {/* Chapter End Assessment Directive Card */}
                {hasPendingChapterTests && nextSection && (
                  <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 sm:p-6 space-y-4 shadow-sm mt-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <AlertCircle size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-amber-950">
                          Selesaikan Tes / Tugas Bab Ini Terlebih Dahulu
                        </h4>
                        <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                          Anda telah membaca seluruh materi pada bab <strong className="font-semibold text-amber-950">&quot;{currentSection?.title}&quot;</strong>. 
                          Untuk membuka materi pada bab selanjutnya (<strong className="font-semibold text-amber-950">&quot;{nextSection.title}&quot;</strong>), 
                          silakan selesaikan tes/tugas evaluasi berikut terlebih dahulu:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {unpassedSecQuizzes.length > 0 && (
                        <div className="p-3.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                              Tes / Kuis Bab
                            </span>
                            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
                              {unpassedSecQuizzes[0].title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {unpassedSecQuizzes.length} tes belum diselesaikan
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              const qIdx = quizzes.findIndex((q) => q.id === unpassedSecQuizzes[0].id);
                              if (qIdx !== -1) setSelectedQuizIdx(qIdx);
                              setActiveTab("quiz");
                            }}
                            rightIcon={<ChevronRight size={14} />}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-xs"
                          >
                            Kerjakan Kuis
                          </Button>
                        </div>
                      )}

                      {unsubmittedSecAssignments.length > 0 && (
                        <div className="p-3.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                              Tugas / Submission
                            </span>
                            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
                              {unsubmittedSecAssignments[0].title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {unsubmittedSecAssignments.length} tugas belum dikirim
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveTab("assignment");
                            }}
                            rightIcon={<ChevronRight size={14} />}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs"
                          >
                            Kirim Tugas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Continue Action */}
                {!completedLessons.has(currentLesson.id) ? (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={() => toggleLessonComplete()}
                      disabled={savingProgress}
                      leftIcon={
                        savingProgress ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle size={15} />
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs min-h-[42px] px-5 shadow-sm"
                    >
                      {savingProgress ? t("saving") : nextLesson ? t("mark_done_next") : t("mark_done")}
                    </Button>
                  </div>
                ) : nextLesson && !isLessonLocked(nextLesson.id) ? (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={() => setCurrentLesson(nextLesson)}
                      rightIcon={<ChevronRight size={15} />}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs min-h-[42px] px-5 shadow-sm"
                    >
                      {t("next")}
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 2: IN-VIDEO TIMESTAMPED STUDY NOTES */}
            {activeTab === "studyNotes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Bookmark size={18} className="text-blue-400" />
                      {locale === "en" ? "My Timestamped Notes" : "Catatan Belajar Ber-Timestamp"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {locale === "en"
                        ? "Save personal timestamps & notes while learning. Export anytime to Markdown."
                        : "Tulis catatan dan tandai momen penting pada materi ini. Unduh kapan saja ke format Markdown."}
                    </p>
                  </div>
                  {studyNotes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportNotes}
                      leftIcon={<Download size={14} />}
                      className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs shrink-0 shadow-2xs"
                    >
                      {locale === "en" ? "Export to (.md)" : "Unduh Catatan (.md)"}
                    </Button>
                  )}
                </div>

                {/* Form Add Note */}
                <form onSubmit={handleCreateNote} className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {locale === "en" ? "Add Note for: " : "Tambah Catatan untuk: "}
                      <span className="text-blue-400">{currentLesson.title}</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <span>⏱️ Detik:</span>
                      <label htmlFor="lesson-note-seconds" className="sr-only">Detik</label>
                      <input id="lesson-note-seconds" name="noteSeconds" type="number" min="0" value={newNoteTimestamp} onChange={(e) => setNewNoteTimestamp(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-center text-xs focus:outline-none focus:border-blue-500"
                        title="Detik dalam video (misal: 60 = 01:00)"
                      />
                    </div>
                  </div>

                  <label htmlFor="lesson-note-content" className="sr-only">Catatan</label>
                  <textarea id="lesson-note-content" name="noteContent" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder={locale === "en" ? "Write your key insight, formula, or reminder here..." : "Tulis ringkasan rumus, poin penting, atau pengingat di sini..."}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingNote || !newNoteContent.trim()}
                      loading={savingNote}
                      leftIcon={<Bookmark size={14} />}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      {locale === "en" ? "Save Note" : "Simpan Catatan"}
                    </Button>
                  </div>
                </form>

                {/* Notes List */}
                {loadingNotes ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-slate-500">{locale === "en" ? "Loading notes..." : "Memuat catatan..."}</span>
                  </div>
                ) : studyNotes.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                    <Bookmark className="mx-auto text-slate-400 mb-2" size={32} />
                    <h4 className="text-sm font-bold text-slate-700">
                      {locale === "en" ? "No notes yet" : "Belum ada catatan"}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {locale === "en"
                        ? "Take timestamped notes while watching video lessons to retain knowledge better."
                        : "Tuliskan poin penting saat menonton video untuk memperkuat pemahaman materi."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studyNotes.map((note) => {
                      const mins = Math.floor(note.timestamp / 60);
                      const secs = note.timestamp % 60;
                      const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

                      return (
                        <div
                          key={note.id}
                          className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-start justify-between gap-3 group shadow-2xs"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-bold">
                                ⏱️ {timeStr}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {note.lesson?.title || "Materi"}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                            title="Hapus catatan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RESOURCE VAULT / BAHAN BELAJAR */}
            {activeTab === "resources" && (() => {
              const formatFileSize = (bytes?: number | null) => {
                if (!bytes || bytes === 0) return null;
                const k = 1024;
                const sizes = ["Bytes", "KB", "MB", "GB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
              };

              const renderResourceCard = (item: CourseResourceItem) => {
                const isCurrentChapter = !!(currentSectionId && item.sectionId === currentSectionId);
                const sectionName = item.section?.title || sections.find((s) => s.id === item.sectionId)?.title;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition-all ${isCurrentChapter
                      ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                      : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
                      }`}
                  >
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          {item.type}
                        </span>

                        {/* Chapter Scope Badge */}
                        {item.sectionId ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-[190px] ${isCurrentChapter
                              ? "bg-blue-900/60 text-blue-300 border border-blue-700/60"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            title={sectionName || ""}
                          >
                            <Layers size={10} className="shrink-0" />
                            <span className="truncate">
                              {isCurrentChapter
                                ? `Khusus Bab Ini (${sectionName || "Bab Ini"})`
                                : sectionName || "Chapter"}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <Globe size={10} />
                            {locale === "en" ? "General (All Chapters)" : "Bahan Umum (Semua Bab)"}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                      )}

                      {(item.fileName || item.fileSize) && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span className="truncate max-w-[180px]" title={item.fileName || ""}>
                            📄 {item.fileName || "Berkas Terlampir"}
                          </span>
                          {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
                        </div>
                      )}
                    </div>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors w-full border border-slate-200 shadow-2xs"
                    >
                      <Download size={14} />
                      <span>{locale === "en" ? "Download / Open Link" : "Unduh / Akses Berkas"}</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  </div>
                );
              };

              return (
                <div className="space-y-6">
                  {/* Banner & Scoped Header */}
                  <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <FolderDown size={18} className="text-blue-400" />
                          {locale === "en" ? "Course Resources & Starter Files" : "Bahan Belajar & Source Code"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {locale === "en"
                            ? "Files follow each chapter configuration so you only see materials relevant to your study."
                            : "Bahan ajar otomatis menyesuaikan dengan bab/section yang sedang Anda pelajari."}
                        </p>
                      </div>

                      {/* Current Chapter Indicator */}
                      {currentSection && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 flex items-center gap-2">
                          <Layers size={13} className="text-blue-400 shrink-0" />
                          <div className="text-[11px] leading-tight">
                            <span className="text-slate-500 block text-[10px]">
                              {locale === "en" ? "Active Chapter:" : "Bab yang Dipelajari:"}
                            </span>
                            <span className="text-blue-300 font-semibold truncate max-w-[160px] block" title={currentSection.title}>
                              {currentSection.title}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Mode Switcher: Only 2 options, no redundancy */}
                    {resources.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setResourceFilter("CHAPTER")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${resourceFilter === "CHAPTER"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
                            }`}
                        >
                          <Layers size={13} />
                          <span>{locale === "en" ? "This Chapter" : "Khusus Bab Ini"} ({currentChapterResources.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResourceFilter("GENERAL")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${resourceFilter === "GENERAL"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
                            }`}
                        >
                          <Globe size={13} />
                          <span>{locale === "en" ? "General Files" : "Bahan Umum"} ({generalResources.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingResources ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                      <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                      <span className="text-xs text-slate-500">
                        {locale === "en" ? "Loading resources..." : "Memuat bahan belajar..."}
                      </span>
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                      <FolderDown className="mx-auto text-slate-400 mb-2" size={32} />
                      <h4 className="text-sm font-bold text-slate-700">
                        {locale === "en" ? "No resources available yet" : "Bahan belajar belum tersedia"}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {locale === "en"
                          ? "The instructor will upload supplementary assets and project files here."
                          : "Instruktur akan mengunggah aset tambahan dan file proyek di bagian ini."}
                      </p>
                    </div>
                  ) : resourceFilter === "CHAPTER" ? (
                    currentChapterResources.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <Layers className="mx-auto text-slate-400 mb-2" size={32} />
                        <h4 className="text-sm font-bold text-slate-700">
                          {locale === "en" ? "No specific files for this chapter" : "Belum Ada Bahan Ajar Khusus Bab Ini"}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {locale === "en"
                            ? `No files attached specifically for "${currentSection?.title || 'this chapter'}". Check the General Files tab above.`
                            : `Bab "${currentSection?.title || 'Bab ini'}" belum memiliki berkas khusus. Anda dapat memeriksa tab "Bahan Umum".`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {currentChapterResources.map(renderResourceCard)}
                      </div>
                    )
                  ) : (
                    generalResources.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <Globe className="mx-auto text-slate-400 mb-2" size={32} />
                        <h4 className="text-sm font-bold text-slate-700">
                          {locale === "en" ? "No general course files" : "Tidak Ada Bahan Belajar Umum"}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {locale === "en"
                            ? "All course materials are assigned directly to their specific chapters."
                            : "Semua bahan belajar untuk kelas ini telah dikelompokkan ke dalam bab masing-masing."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {generalResources.map(renderResourceCard)}
                      </div>
                    )
                  )}
                </div>
              );
            })()}

            {/* TAB 4: INTERACTIVE QUIZZES */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {loadingQuizzes ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-slate-500">{t("loading_quiz")}</span>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-8 text-center space-y-2">
                    <HelpCircle className="mx-auto text-slate-400 mb-2" size={32} />
                    <h3 className="text-base font-bold text-slate-800">{t("quiz_not_available")}</h3>
                    <p className="text-xs text-slate-500">
                      {t("quiz_not_available_desc")}
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Quiz Selector if multiple */}
                    {quizzes.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                        {quizzes.map((q, idx) => (
                          <button
                            key={q.id}
                            onClick={() => {
                              setSelectedQuizIdx(idx);
                              const targetQuiz = quizzes[idx];
                              if (targetQuiz?.attempts && targetQuiz.attempts.length > 0) {
                                const attempt = targetQuiz.attempts[0];
                                setUserAnswers((attempt.answers as Record<string, number>) || {});
                                setQuizSubmitted(true);
                              } else {
                                setUserAnswers({});
                                setQuizSubmitted(false);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${selectedQuizIdx === idx
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
                              }`}
                          >
                            {t("quiz_label", { n: idx + 1 })}: {q.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {(() => {
                      const quiz = quizzes[selectedQuizIdx];
                      if (!quiz) return null;

                      // Check chapter lock
                      const quizSection = quiz.sectionId
                        ? sections.find((s) => s.id === quiz.sectionId)
                        : null;
                      const isQuizLocked = quizSection
                        ? quizSection.lessons.length > 0 &&
                        !quizSection.lessons.every((l) => completedLessons.has(l.id))
                        : false;
                      const uncompletedSectionLessons = quizSection
                        ? (quizSection.lessons || []).filter((l) => !completedLessons.has(l.id))
                        : [];
                      const completedSectionLessonsCount = quizSection
                        ? (quizSection.lessons || []).filter((l) => completedLessons.has(l.id)).length
                        : 0;

                      if (isQuizLocked && quizSection) {
                        return (
                          <div className="space-y-6">
                            {/* Quiz Header Banner */}
                            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    📘 Bab: {quizSection.title}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Lock size={11} /> Tes Terkunci
                                  </span>
                                </div>
                                {quiz.description && (
                                  <p className="text-xs text-slate-500 mt-1">{quiz.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Lock Notification Card */}
                            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-amber-200 text-center space-y-4 shadow-2xs">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                <Lock size={32} />
                              </div>
                              <div className="space-y-1.5 max-w-lg mx-auto">
                                <h4 className="text-base font-bold text-slate-900">
                                  Selesaikan Materi Bab Terlebih Dahulu
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  Tes ini dikhususkan untuk menguji pemahaman bab{" "}
                                  <span className="text-amber-300 font-semibold">&ldquo;{quizSection.title}&rdquo;</span>.
                                  Anda harus menyelesaikan seluruh materi di bab ini agar tes terbuka dan dapat dikerjakan.
                                </p>
                              </div>

                              {/* Progress in this section */}
                              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500">Progres Pembelajaran Bab Ini:</span>
                                  <span className="text-amber-300 font-bold">
                                    {completedSectionLessonsCount} / {quizSection.lessons.length} Selesai ({Math.round((completedSectionLessonsCount / quizSection.lessons.length) * 100)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.round((completedSectionLessonsCount / quizSection.lessons.length) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Incomplete Lessons list */}
                              <div className="max-w-md mx-auto text-left space-y-2 pt-2">
                                <span className="text-xs font-semibold text-slate-500 block">
                                  Materi yang belum diselesaikan ({uncompletedSectionLessons.length}):
                                </span>
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                  {uncompletedSectionLessons.map((l) => (
                                    <div
                                      key={l.id}
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <Play size={12} className="text-slate-400 shrink-0" />
                                        <span className="truncate text-slate-800">{l.title}</span>
                                      </div>
                                      <button
                                        type="button"
                                        disabled={isLessonLocked(l.id)}
                                        onClick={() => {
                                          if (isLessonLocked(l.id)) return;
                                          setCurrentLesson(l);
                                          setActiveTab("notes");
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${isLessonLocked(l.id)
                                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                          : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300"
                                          }`}
                                      >
                                        {isLessonLocked(l.id) ? "Terkunci" : "Pelajari →"}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const questions = quiz.questions || [];

                      const latestAttempt = quiz.attempts?.[0];
                      const correctCount = questions.reduce((acc, q) => {
                        return acc + (userAnswers[q.id] === q.correctAnswer ? 1 : 0);
                      }, 0);
                      const currentScore = latestAttempt && quizSubmitted
                        ? latestAttempt.score
                        : (questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0);
                      const isPassed = latestAttempt && quizSubmitted
                        ? latestAttempt.passed
                        : currentScore >= quiz.passingScore;

                      return (
                        <div className="space-y-6">
                          {/* Quiz Header Banner */}
                          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                                {quizSection && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    📘 Bab: {quizSection.title}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  KKM: {quiz.passingScore}%
                                </span>
                              </div>
                              {quiz.description && (
                                <p className="text-xs text-slate-500 mt-1">{quiz.description}</p>
                              )}
                            </div>

                            {quizSubmitted && (
                              <div
                                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${isPassed
                                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                                  : "bg-red-500/10 border-red-500/30 text-red-400"
                                  }`}
                              >
                                {isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                {t("score_label", { score: currentScore, status: isPassed ? t("passed") : t("not_passed") })}
                              </div>
                            )}
                          </div>

                          {/* Questions List */}
                          <div className="space-y-4">
                            {questions.map((q, qIndex) => {
                              const userAnswer = userAnswers[q.id];
                              const isCorrect = userAnswer === q.correctAnswer;

                              return (
                                <div
                                  key={q.id}
                                  className={`p-5 rounded-2xl border transition-all ${quizSubmitted
                                    ? isCorrect
                                      ? "bg-green-950/20 border-green-800/60"
                                      : "bg-red-950/20 border-red-800/60"
                                    : "bg-white border-slate-200/80 shadow-2xs"
                                    }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {qIndex + 1}
                                    </span>
                                    <div className="space-y-3 flex-1">
                                      <p className="text-sm font-semibold text-slate-900">
                                        {q.question}
                                      </p>

                                      {/* Options */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {q.options.map((opt, optIdx) => {
                                          const isSelected = userAnswer === optIdx;
                                          const isThisCorrect = optIdx === q.correctAnswer;
                                          const label = String.fromCharCode(65 + optIdx);
                                          let optStyle =
                                            "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700";

                                          if (quizSubmitted) {
                                            if (isCorrect) {
                                              if (isThisCorrect) {
                                                optStyle =
                                                  "bg-green-600/20 border-green-500 text-green-300 font-semibold";
                                              }
                                            } else {
                                              if (isSelected) {
                                                optStyle =
                                                  "bg-red-600/20 border-red-500 text-red-300 font-semibold";
                                              }
                                            }
                                          } else if (isSelected) {
                                            optStyle =
                                              "bg-blue-600/20 border-blue-500 text-blue-200 font-semibold";
                                          }

                                          return (
                                            <button
                                              key={optIdx}
                                              type="button"
                                              disabled={quizSubmitted}
                                              onClick={() =>
                                                setUserAnswers((prev) => ({
                                                  ...prev,
                                                  [q.id]: optIdx,
                                                }))
                                              }
                                              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-colors ${optStyle}`}
                                            >
                                              <span
                                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected
                                                  ? quizSubmitted
                                                    ? isCorrect
                                                      ? "bg-green-600 text-white"
                                                      : "bg-red-600 text-white"
                                                    : "bg-blue-600 text-white"
                                                  : "bg-slate-200 text-slate-700"
                                                  }`}
                                              >
                                                {label}
                                              </span>
                                              <span className="flex-1">{opt}</span>
                                              {quizSubmitted && (
                                                isCorrect ? (
                                                  isThisCorrect && (
                                                    <CheckCircle2
                                                      size={14}
                                                      className="text-green-400 shrink-0"
                                                    />
                                                  )
                                                ) : (
                                                  isSelected && (
                                                    <XCircle
                                                      size={14}
                                                      className="text-red-400 shrink-0"
                                                    />
                                                  )
                                                )
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Explanation ONLY if answer is correct */}
                                      {quizSubmitted && isCorrect && q.explanation && (
                                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300 flex items-start gap-2">
                                          <Sparkles
                                            size={14}
                                            className="text-green-400 mt-0.5 shrink-0"
                                          />
                                          <div>
                                            <span className="font-bold">{t("explanation_label")}</span>
                                            {q.explanation}
                                          </div>
                                        </div>
                                      )}

                                      {/* Feedback if answer is incorrect */}
                                      {quizSubmitted && !isCorrect && (
                                        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
                                          <XCircle size={14} className="text-red-400 shrink-0" />
                                          <span>{t("wrong_answer")}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-3 pt-2">
                            {quizSubmitted ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setUserAnswers({});
                                  setQuizSubmitted(false);
                                }}
                                leftIcon={<RotateCcw size={14} />}
                                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                              >
                                {t("retake_quiz")}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                loading={submittingQuiz}
                                disabled={
                                  Object.keys(userAnswers).length < questions.length
                                }
                                onClick={() => handleSubmitQuiz(quiz.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                leftIcon={<CheckCircle2 size={15} />}
                              >
                                {t("submit_quiz")}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ASSIGNMENTS & SUBMISSION */}
            {activeTab === "assignment" && (
              <div className="space-y-6">
                {loadingAssignments ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-slate-500">{t("loading_assignments")}</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-8 text-center space-y-2">
                    <FileCode2 className="mx-auto text-slate-400 mb-2" size={32} />
                    <h3 className="text-base font-bold text-slate-800">{t("no_assignments")}</h3>
                    <p className="text-xs text-slate-500">
                      {t("no_assignments_desc")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assignments.map((assignment, idx) => {
                      const userSub = assignment.submissions?.[0];
                      const currentFile = submissionFileInput[assignment.id];

                      const assignSection = assignment.sectionId
                        ? sections.find((s) => s.id === assignment.sectionId)
                        : null;
                      const isAssignLocked = assignSection
                        ? assignSection.lessons.length > 0 &&
                        !assignSection.lessons.every((l) => completedLessons.has(l.id))
                        : false;
                      const uncompletedAssignLessons = assignSection
                        ? (assignSection.lessons || []).filter((l) => !completedLessons.has(l.id))
                        : [];
                      const completedAssignCount = assignSection
                        ? (assignSection.lessons || []).filter((l) => completedLessons.has(l.id)).length
                        : 0;

                      return (
                        <div
                          key={assignment.id}
                          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs"
                        >
                          <div className="p-5 border-b border-slate-100 flex items-start gap-3">
                            <span className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-slate-900">
                                  {assignment.title}
                                </h3>
                                {assignSection && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    📘 Bab: {assignSection.title}
                                  </span>
                                )}
                                {isAssignLocked && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Lock size={11} /> Tugas Terkunci
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                {assignment.description}
                              </p>

                              {/* Admin Attached File */}
                              {assignment.fileUrl && (
                                <div className="pt-1">
                                  <a
                                    href={assignment.fileUrl}
                                    download={assignment.fileName || "lampiran"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                                  >
                                    <Download size={13} className="text-blue-400" />
                                    <span>{t("attachment_guide", { name: assignment.fileName || t("download_guide") })}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-5 bg-slate-50/50">
                            {isAssignLocked && assignSection ? (
                              <div className="p-6 rounded-xl bg-gradient-to-b from-white to-slate-50 border border-amber-500/30 text-center space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                  <Lock size={24} />
                                </div>
                                <div className="space-y-1.5 max-w-md mx-auto">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    Selesaikan Seluruh Materi Bab Ini Terlebih Dahulu
                                  </h4>
                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    Tugas proyek ini terikat pada bab{" "}
                                    <span className="text-amber-300 font-semibold">&ldquo;{assignSection.title}&rdquo;</span>.
                                    Anda harus menyelesaikan seluruh materi di bab ini terlebih dahulu agar dapat mengumpulkan tugas.
                                  </p>
                                </div>

                                {/* Progress */}
                                <div className="max-w-sm mx-auto p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Progres Pembelajaran Bab:</span>
                                    <span className="text-amber-300 font-bold">
                                      {completedAssignCount} / {assignSection.lessons.length} Selesai ({Math.round((completedAssignCount / assignSection.lessons.length) * 100)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.round((completedAssignCount / assignSection.lessons.length) * 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Incomplete Lessons list */}
                                <div className="max-w-sm mx-auto text-left space-y-2 pt-1">
                                  <span className="text-xs font-semibold text-slate-500 block">
                                    Materi yang belum selesai ({uncompletedAssignLessons.length}):
                                  </span>
                                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                    {uncompletedAssignLessons.map((l) => (
                                      <div
                                        key={l.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <Play size={12} className="text-slate-400 shrink-0" />
                                          <span className="truncate text-slate-800">{l.title}</span>
                                        </div>
                                        <button
                                          type="button"
                                          disabled={isLessonLocked(l.id)}
                                          onClick={() => {
                                            if (isLessonLocked(l.id)) return;
                                            setCurrentLesson(l);
                                            setActiveTab("notes");
                                          }}
                                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${isLessonLocked(l.id)
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300"
                                            }`}
                                        >
                                          {isLessonLocked(l.id) ? "Terkunci" : "Pelajari →"}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : userSub ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-xs font-bold text-slate-500">
                                    {t("submission_status")}
                                  </span>
                                  {userSub.status === "APPROVED" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                                      <CheckCircle2 size={13} />
                                      {t("approved", { score: userSub.score ?? 100 })}
                                    </span>
                                  ) : userSub.status === "REJECTED" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                      <XCircle size={13} />
                                      {t("rejected", { score: userSub.score ?? 0 })}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      <Clock size={13} />
                                      {t("under_review")}
                                    </span>
                                  )}
                                </div>

                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs">
                                  {userSub.content && (
                                    <div>
                                      <span className="text-slate-500 block mb-1">
                                        {t("submission_link_label")}
                                      </span>
                                      {userSub.content.startsWith("http") ? (
                                        <a
                                          href={userSub.content}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:underline font-mono flex items-center gap-1.5 break-all"
                                        >
                                          {userSub.content}
                                          <ExternalLink size={12} className="shrink-0" />
                                        </a>
                                      ) : (
                                        <p className="font-mono text-slate-800">{userSub.content}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Uploaded File Download */}
                                  {userSub.fileUrl && (
                                    <div className="pt-1">
                                      <span className="text-slate-500 block mb-1">
                                        {t("submitted_file_label")}
                                      </span>
                                      <a
                                        href={userSub.fileUrl}
                                        download={userSub.fileName || "submission"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
                                      >
                                        <Download size={13} className="text-slate-500" />
                                        <span>{userSub.fileName || t("download_submission")}</span>
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {userSub.feedback && (
                                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
                                    <span className="font-bold text-amber-300">
                                      {t("mentor_note")}
                                    </span>
                                    <p className="text-slate-800 leading-relaxed">
                                      {userSub.feedback}
                                    </p>
                                  </div>
                                )}

                                {userSub.status === "REJECTED" && (
                                  <div className="pt-2 space-y-3">
                                    <label htmlFor={"revision-url-" + assignment.id} className="block text-xs font-semibold text-slate-700">{t("submit_revision")}</label>

                                    <input id={"revision-url-" + assignment.id} name={"revisionUrl_" + assignment.id} type="text" placeholder={t("revision_placeholder")} value={submissionUrlInput[assignment.id] || ""}
                                      onChange={(e) =>
                                        setSubmissionUrlInput((prev) => ({
                                          ...prev,
                                          [assignment.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                                    />

                                    {/* Revision File Upload */}
                                    {currentFile ? (
                                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                          <Paperclip size={14} className="text-blue-400 shrink-0" />
                                          <span className="font-semibold text-blue-200 truncate">
                                            {currentFile.fileName}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSubmissionFileInput((prev) => {
                                              const updated = { ...prev };
                                              delete updated[assignment.id];
                                              return updated;
                                            })
                                          }
                                          className="text-slate-500 hover:text-red-400 p-1"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-200 hover:bg-white cursor-pointer text-xs text-slate-500 hover:text-slate-800 transition-colors">
                                        {uploadingForAssignmentId === assignment.id ? (
                                          <span className="flex items-center gap-2 text-blue-400">
                                            <Loader2 size={14} className="animate-spin" />
                                            {t("uploading")}
                                          </span>
                                        ) : (
                                          <>
                                            <Upload size={14} />
                                            <span>{t("upload_revision")}</span>
                                          </>
                                        )}
                                        <input id={"revision-file-upload-" + assignment.id} name={"revisionFile_" + assignment.id} type="file" disabled={uploadingForAssignmentId === assignment.id} onChange={(e) => handleStudentFileUpload(assignment.id, e)} className="hidden" />
                                      </label>
                                    )}

                                    <div className="flex justify-end">
                                      <Button
                                        type="button"
                                        size="sm"
                                        loading={submittingAssignmentId === assignment.id}
                                        onClick={() => handleSubmitAssignment(assignment.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                        leftIcon={<Send size={13} />}
                                      >
                                        {t("submit_revision_btn")}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <label htmlFor={"assign-url-" + assignment.id} className="block text-xs font-semibold text-slate-700 mb-1">{t("submit_url_placeholder")}</label>
                                  <input id={"assign-url-" + assignment.id} name={"assignUrl_" + assignment.id} type="text" placeholder="https://github.com/username/project..." value={submissionUrlInput[assignment.id] || ""}
                                    onChange={(e) =>
                                      setSubmissionUrlInput((prev) => ({
                                        ...prev,
                                        [assignment.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                                  />
                                </div>

                                {/* Upload File option */}
                                <div>
                                  <label htmlFor={"assign-file-" + assignment.id} className="block text-xs font-semibold text-slate-700 mb-1">{t("upload_file_label")}</label>

                                  {currentFile ? (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                                      <div className="flex items-center gap-2 truncate">
                                        <Paperclip size={14} className="text-blue-400 shrink-0" />
                                        <span className="font-semibold text-blue-200 truncate">
                                          {currentFile.fileName}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSubmissionFileInput((prev) => {
                                            const updated = { ...prev };
                                            delete updated[assignment.id];
                                            return updated;
                                          })
                                        }
                                        className="text-slate-500 hover:text-red-400 p-1"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors bg-white text-center">
                                      {uploadingForAssignmentId === assignment.id ? (
                                        <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                                          <Loader2 size={16} className="animate-spin" />
                                          {t("uploading")}
                                        </div>
                                      ) : (
                                        <>
                                          <Upload size={18} className="text-slate-500 mb-1" />
                                          <span className="text-xs font-semibold text-slate-700">
                                            {t("upload_file_label")}
                                          </span>
                                        </>
                                      )}
                                      <input id={"student-file-upload-" + assignment.id} name={"studentFile_" + assignment.id} type="file" disabled={uploadingForAssignmentId === assignment.id} onChange={(e) => handleStudentFileUpload(assignment.id, e)} className="hidden" />
                                    </label>
                                  )}
                                </div>

                                <div className="flex justify-end pt-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    loading={submittingAssignmentId === assignment.id}
                                    onClick={() => handleSubmitAssignment(assignment.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                    leftIcon={<Send size={13} />}
                                  >
                                    {t("submit_assignment")}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: REAL DISCUSSIONS & Q&A */}
            {activeTab === "discussion" && (
              <div className="space-y-6">
                {/* Form Ajukan Pertanyaan */}
                <form
                  onSubmit={handlePostDiscussion}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-slate-900">
                    {t("post_discussion")}
                  </h3>
                  <label htmlFor="learn-discussion-topic" className="sr-only">Topik Diskusi</label>
                  <textarea id="learn-discussion-topic" name="topicContent" rows={3} value={newTopicText} onChange={(e) => setNewTopicText(e.target.value)}
                    placeholder={t("discussion_placeholder")}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      loading={sendingTopic}
                      leftIcon={<Send size={14} />}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t("post_discussion")}
                    </Button>
                  </div>
                </form>

                {loadingDiscussions ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-slate-500">
                      {locale === "en" ? "Loading discussions..." : "Memuat diskusi kelas..."}
                    </span>
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map((d) => (
                      <div
                        key={d.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs"
                      >
                        {/* Topic Header & Content */}
                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden">
                                {d.user?.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={d.user.image} alt={d.user.name || "User"} width={32} height={32} loading="eager" style={{ aspectRatio: "1 / 1" }} className="w-full h-full object-cover aspect-square" />
                                ) : (
                                  <UserIcon size={14} className="text-slate-500" />
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-800">
                                  {d.user?.name || (locale === "en" ? "User" : "Pengguna")}
                                </span>
                                {d.user?.role === "ADMIN" && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                                    <ShieldCheck size={11} />
                                    {locale === "en" ? "Instructor" : "Instruktur"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(d.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 pl-10 leading-relaxed whitespace-pre-wrap">
                            {d.content}
                          </p>
                        </div>

                        {/* Replies */}
                        <div className="bg-slate-50/60 border-t border-slate-100 p-4 space-y-3">
                          {d.replies.length > 0 && (
                            <div className="space-y-2.5 mb-3">
                              {d.replies.map((reply) => {
                                const isAdmin = reply.user?.role === "ADMIN";
                                return (
                                  <div
                                    key={reply.id}
                                    className={`p-3 rounded-xl border text-xs space-y-1 ${isAdmin
                                      ? "bg-blue-50/60 border-blue-200 text-slate-800"
                                      : "bg-white border-slate-200 text-slate-800 shadow-2xs"
                                      }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                          {reply.user?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={reply.user.image} alt={reply.user.name || "User"} width={20} height={20} loading="eager" style={{ aspectRatio: "1 / 1" }} className="w-full h-full object-cover aspect-square" />
                                          ) : (
                                            <UserIcon size={10} className="text-slate-500" />
                                          )}
                                        </div>
                                        <span className="font-bold text-slate-800">
                                          {reply.user?.name || (locale === "en" ? "User" : "Pengguna")}
                                        </span>
                                        {isAdmin && (
                                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                                            {locale === "en" ? "Instructor" : "Instruktur"}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(reply.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-slate-700 pl-7 leading-relaxed whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Reply Box */}
                          <div className="flex gap-2">
                            <label htmlFor={"reply-input-" + d.id} className="sr-only">Balas</label>
                            <input id={"reply-input-" + d.id} name="replyContent" type="text" placeholder={t("reply_placeholder")} value={replyTexts[d.id] || ""}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({ ...prev, [d.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendReply(d.id);
                                }
                              }}
                              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                            />
                            <Button
                              type="button"
                              size="sm"
                              loading={sendingReplyId === d.id}
                              onClick={() => handleSendReply(d.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0"
                              leftIcon={<Send size={12} />}
                            >
                              {t("send_reply")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                    {t("discussion_empty")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gamification Interactive Graduation Celebration Modal */}
      <GraduationCelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        courseTitle={celebrationData.courseTitle}
        studentName={celebrationData.studentName}
        certificateCode={celebrationData.certificateCode}
        certificateUrl={celebrationData.certificateUrl}
        score={celebrationData.score}
        isQuizScore={celebrationData.isQuizScore}
      />
    </div>
  );
}
