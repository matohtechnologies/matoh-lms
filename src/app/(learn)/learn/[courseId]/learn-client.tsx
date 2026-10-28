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
  BookOpen,
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
  Paperclip,
  Bookmark,
  FolderDown,
  Trash2,
  Globe,
  Layers,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { triggerCelebrationConfetti, triggerMicroConfetti } from "@/lib/confetti";
import { playPopSound, playSuccessChime, playFanfareSound } from "@/lib/sound-effects";
import { GraduationCelebrationModal } from "@/components/gamification/graduation-celebration-modal";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

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

  const { data: session } = useSession();
  const [currentLesson, setCurrentLesson] = useState<LearnLesson>(defaultLesson);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );
  const [savingProgress, setSavingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "notes" | "studyNotes" | "resources" | "quiz" | "assignment" | "discussion"
  >("notes");

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
    const isCurrentlyCompleted = completedLessons.has(lessonId);
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

    // If marked as completed on current lesson and there is a next lesson, advance to next
    if (newCompleted && lessonId === currentLesson.id && nextLesson) {
      setCurrentLesson(nextLesson);
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
    <div className="flex h-screen bg-stone-950 text-stone-200 overflow-hidden font-sans">
      {/* Sidebar: Lessons Navigation */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } shrink-0 bg-stone-900 border-r border-stone-800 transition-all duration-300 overflow-hidden flex flex-col z-20`}
      >
        {/* Brand & Course Title */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 mb-3 group">
            <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700/80 flex items-center justify-center p-1 group-hover:border-stone-600 transition-colors">
              <Image
                src="/images/matoh-logo-white.png"
                alt="Matoh Technologies"
                width={18}
                height={18}
                priority
                style={{ aspectRatio: "1 / 1" }}
                className="object-contain aspect-square"
              />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Matoh<span className="text-blue-400">Technologies</span>
            </span>
          </Link>
          <h2 className="text-sm font-bold text-stone-100 leading-snug line-clamp-2" title={course.title}>
            {course.title}
          </h2>
          <div className="mt-3 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5 font-medium">
              <span>{t("progress")}</span>
              <span className="text-blue-400 font-bold">{t("done_pct", { pct: progress })}</span>
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
                className="group rounded-xl border border-stone-800/70 overflow-hidden bg-stone-950/40"
              >
                <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-stone-800/60 list-none select-none transition-colors">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    {section.title}
                  </span>
                  <ChevronDown size={14} className="text-stone-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="divide-y divide-stone-800/40">
                  {section.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all ${
                          isActive
                            ? "bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500"
                            : "hover:bg-stone-800/40 text-stone-300 border-l-2 border-transparent"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonComplete(lesson.id);
                          }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110 ${
                            isCompleted
                              ? "bg-green-600 text-white"
                              : isActive
                              ? "border-2 border-blue-500 text-blue-400"
                              : "border border-stone-600 text-stone-500"
                          }`}
                          title={
                            isCompleted
                              ? t("toggle_complete")
                              : t("toggle_incomplete")
                          }
                        >
                          {isCompleted ? <CheckCircle size={12} /> : <Play size={8} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentLesson(lesson)}
                          className="text-xs truncate flex-1 text-left hover:text-white transition-colors"
                        >
                          {lesson.title}
                        </button>
                      </div>
                    );
                  })}

                  {/* Specific Learning Materials for this Section */}
                  {secResources.length > 0 && (
                    <div className="p-2.5 bg-stone-900/70 border-t border-stone-800/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 px-1">
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
                            className="flex items-center justify-between p-1.5 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-stone-800/80 text-[11px] text-stone-300 hover:text-white transition-colors group"
                            title={res.title}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              <Paperclip size={11} className="text-stone-500 group-hover:text-blue-400 shrink-0" />
                              <span className="truncate">{res.title}</span>
                            </span>
                            <Download size={11} className="text-stone-500 group-hover:text-blue-400 shrink-0 ml-1.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quizzes specifically for this section */}
                  {secQuizzes.length > 0 && (
                    <div className="p-2.5 bg-stone-900/60 border-t border-stone-800/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 px-1">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <HelpCircle size={12} />
                          <span>Kuis Bab Ini ({secQuizzes.length})</span>
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
                              className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors group ${
                                isSecCompleted
                                  ? "bg-stone-950/70 hover:bg-stone-800 border-stone-800/80 text-stone-200 hover:text-white"
                                  : "bg-stone-950/40 border-stone-800/40 text-stone-400 hover:bg-stone-900/60"
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
                                  <Lock size={13} className="text-stone-500 shrink-0" />
                                )}
                                <span className="truncate font-medium">{q.title}</span>
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
                                  !isSecCompleted
                                    ? "bg-stone-800 text-stone-500"
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
                    <div className="p-2.5 bg-stone-900/60 border-t border-stone-800/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 px-1">
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
                              className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors group ${
                                isSecCompleted
                                  ? "bg-stone-950/70 hover:bg-stone-800 border-stone-800/80 text-stone-200 hover:text-white"
                                  : "bg-stone-950/40 border-stone-800/40 text-stone-400 hover:bg-stone-900/60"
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
                                  <Lock size={13} className="text-stone-500 shrink-0" />
                                )}
                                <span className="truncate font-medium">{a.title}</span>
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
                                  !isSecCompleted
                                    ? "bg-stone-800 text-stone-500"
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
              className="group rounded-xl border border-stone-800/70 overflow-hidden bg-stone-950/40"
            >
              <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-stone-800/60 list-none select-none transition-colors">
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
                  <ChevronDown size={14} className="text-stone-500 group-open:rotate-180 transition-transform" />
                </div>
              </summary>
              <div className="p-2 space-y-1 bg-stone-900/60">
                {generalResources.map((res) => (
                  <a
                    key={res.id}
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-1.5 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-stone-800/80 text-[11px] text-stone-300 hover:text-white transition-colors group"
                    title={res.title}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <Paperclip size={11} className="text-stone-500 group-hover:text-emerald-400 shrink-0" />
                      <span className="truncate">{res.title}</span>
                    </span>
                    <Download size={11} className="text-stone-500 group-hover:text-emerald-400 shrink-0 ml-1.5" />
                  </a>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Certificate Section at Sidebar Bottom */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/90">
          {certStatus?.isEnabled === false ? (
            <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-800 text-stone-500 text-[11px] text-center">
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
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-400">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                    <Lock size={13} className="text-amber-500" />
                    <span>{t("cert_locked")}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400">
                    {progress}%
                  </span>
                </div>

                {/* Criteria Checklist */}
                <div className="space-y-1 pt-1.5 border-t border-stone-700/50 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">
                      • {t("criteria_material", { done: completedLessons.size, total: allLessons.length })}
                    </span>
                    {(certStatus?.criteria?.progress?.met ?? false) ||
                    progress >= (certStatus?.criteria?.progress?.required ?? 100) ? (
                      <span className="text-green-400 flex items-center gap-0.5 font-semibold">
                        <Check size={11} /> {t("criteria_done")}
                      </span>
                    ) : (
                      <span className="text-stone-500">
                        {t("criteria_min", { pct: certStatus?.criteria?.progress?.required ?? 100 })}
                      </span>
                    )}
                  </div>

                  {certStatus?.criteria?.quizzes?.required &&
                    (certStatus.criteria.quizzes.total > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-300">
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
                        <span className="text-stone-300">
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
      </aside>

      {/* Main Learning Classroom Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              title={sidebarOpen ? t("close_syllabus") : t("open_syllabus")}
            >
              {sidebarOpen ? <X size={18} /> : <List size={18} />}
            </button>
            <span className="text-sm font-semibold text-stone-200 truncate">
              {currentLesson.title}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/my-courses"
              className="text-xs text-stone-400 hover:text-blue-400 font-medium transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>{t("back_to_dashboard")}</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Stage: Video + Tabbed Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Video Player Stage (only rendered if lesson has a video) */}
          {Boolean(currentLesson.videoUrl?.trim()) && (
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
                src={getEmbedUrl(currentLesson.videoUrl!) || ""}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={currentLesson.title}
              />
            </div>
          )}

          {/* Interactive Navigation Bar below player */}
          <div className="bg-stone-900 border-y border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
              disabled={!prevLesson}
              leftIcon={<ChevronLeft size={16} />}
              className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 disabled:opacity-40"
            >
              {t("prev")}
            </Button>

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
              className={
                completedLessons.has(currentLesson.id)
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }
            >
              {savingProgress
                ? t("saving")
                : completedLessons.has(currentLesson.id)
                ? t("done_check")
                : nextLesson
                ? t("mark_done_next")
                : t("mark_done")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => nextLesson && setCurrentLesson(nextLesson)}
              disabled={!nextLesson}
              rightIcon={<ChevronRight size={16} />}
              className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 disabled:opacity-40"
            >
              {t("next")}
            </Button>
          </div>

          {/* Dicoding-style Tabs: Notes, Study Notes, Resources, Quiz, Assignments, Discussion */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            {/* Horizontal Scrollable Tab Bar with overflow arrows and indicators */}
            <div className="relative border-b border-stone-800 mb-6">
              {/* Left Scroll Navigation button if overflowed */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-6 bg-gradient-to-r from-stone-950 via-stone-950/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => tabScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                    aria-label="Scroll tabs left"
                    className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white shadow-lg border border-stone-700/60 transition-all hover:scale-105"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}

              {/* Scrollable container */}
              <div
                ref={tabScrollRef}
                onScroll={checkTabScroll}
                className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
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
                    key: "quiz",
                    label: locale === "en" ? "Quiz" : "Kuis Evaluasi",
                    icon: HelpCircle,
                    count: quizzes.length,
                  },
                  {
                    key: "assignment",
                    label: locale === "en" ? "Assignments" : "Tugas & Submission",
                    icon: FileCode2,
                    count: assignments.length,
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
                    className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 group ${
                      activeTab === key
                        ? "text-blue-400 border-blue-500"
                        : "text-stone-400 border-transparent hover:text-stone-200 hover:border-stone-700"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        activeTab === key
                          ? "text-blue-400"
                          : "text-stone-400 group-hover:text-stone-200 transition-colors"
                      }
                    />
                    <span>{label}</span>
                    {typeof count === "number" && (
                      <span
                        className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                          activeTab === key
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold"
                            : "bg-stone-800 text-stone-400 border border-stone-700/60 group-hover:text-stone-300"
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
                <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-6 bg-gradient-to-l from-stone-950 via-stone-950/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => tabScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                    aria-label="Scroll tabs right"
                    className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white shadow-lg border border-stone-700/60 transition-all hover:scale-105"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: NOTES & LESSON CONTENT */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-stone-100">{currentLesson.title}</h2>
                {currentLesson.content ? (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 text-sm text-stone-200 leading-relaxed shadow-lg">
                    <MarkdownRenderer content={currentLesson.content} dark={true} />
                  </div>
                ) : (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 text-center text-sm text-stone-500">
                    {t("no_notes")}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: IN-VIDEO TIMESTAMPED STUDY NOTES */}
            {activeTab === "studyNotes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-2xl">
                  <div>
                    <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                      <Bookmark size={18} className="text-blue-400" />
                      {locale === "en" ? "My Timestamped Notes" : "Catatan Belajar Ber-Timestamp"}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
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
                      className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 text-xs shrink-0"
                    >
                      {locale === "en" ? "Export to (.md)" : "Unduh Catatan (.md)"}
                    </Button>
                  )}
                </div>

                {/* Form Add Note */}
                <form onSubmit={handleCreateNote} className="bg-stone-900/90 border border-stone-800 p-4 sm:p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300">
                      {locale === "en" ? "Add Note for: " : "Tambah Catatan untuk: "}
                      <span className="text-blue-400">{currentLesson.title}</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
                      <span>⏱️ Detik:</span>
                      <label htmlFor="lesson-note-seconds" className="sr-only">Detik</label>
                      <input id="lesson-note-seconds" name="noteSeconds" type="number" min="0" value={newNoteTimestamp} onChange={(e) => setNewNoteTimestamp(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 px-2 py-1 rounded bg-stone-800 border border-stone-700 text-stone-200 text-center text-xs focus:outline-none focus:border-blue-500"
                        title="Detik dalam video (misal: 60 = 01:00)"
                      />
                    </div>
                  </div>

                  <label htmlFor="lesson-note-content" className="sr-only">Catatan</label>
                  <textarea id="lesson-note-content" name="noteContent" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder={locale === "en" ? "Write your key insight, formula, or reminder here..." : "Tulis ringkasan rumus, poin penting, atau pengingat di sini..."}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-blue-500"
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
                  <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-stone-400">{locale === "en" ? "Loading notes..." : "Memuat catatan..."}</span>
                  </div>
                ) : studyNotes.length === 0 ? (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                    <Bookmark className="mx-auto text-stone-600 mb-2" size={32} />
                    <h4 className="text-sm font-bold text-stone-300">
                      {locale === "en" ? "No notes yet" : "Belum ada catatan"}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
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
                          className="p-4 rounded-xl bg-stone-900 border border-stone-800/90 flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60 text-blue-400 font-mono text-[11px] font-bold">
                                ⏱️ {timeStr}
                              </span>
                              <span className="text-xs font-semibold text-stone-300">
                                {note.lesson?.title || "Materi"}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-stone-500 hover:text-red-400 p-1 transition-colors"
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
                    className={`p-5 rounded-2xl bg-stone-900 border flex flex-col justify-between transition-colors ${
                      isCurrentChapter
                        ? "border-blue-600/60 ring-1 ring-blue-500/20"
                        : "border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/40">
                          {item.type}
                        </span>

                        {/* Chapter Scope Badge */}
                        {item.sectionId ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-[190px] ${
                              isCurrentChapter
                                ? "bg-blue-900/60 text-blue-300 border border-blue-700/60"
                                : "bg-stone-800 text-stone-400 border border-stone-700"
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

                      <h4 className="text-sm font-bold text-stone-100 leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-stone-400 leading-relaxed">{item.description}</p>
                      )}

                      {(item.fileName || item.fileSize) && (
                        <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 font-mono">
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
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors w-full border border-stone-700"
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
                  <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                          <FolderDown size={18} className="text-blue-400" />
                          {locale === "en" ? "Course Resources & Starter Files" : "Bahan Belajar & Source Code"}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">
                          {locale === "en"
                            ? "Files follow each chapter configuration so you only see materials relevant to your study."
                            : "Bahan ajar otomatis menyesuaikan dengan bab/section yang sedang Anda pelajari."}
                        </p>
                      </div>

                      {/* Current Chapter Indicator */}
                      {currentSection && (
                        <div className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 shrink-0 flex items-center gap-2">
                          <Layers size={13} className="text-blue-400 shrink-0" />
                          <div className="text-[11px] leading-tight">
                            <span className="text-stone-400 block text-[10px]">
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
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-800/80 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setResourceFilter("CHAPTER")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            resourceFilter === "CHAPTER"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700/80"
                          }`}
                        >
                          <Layers size={13} />
                          <span>{locale === "en" ? "This Chapter" : "Khusus Bab Ini"} ({currentChapterResources.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResourceFilter("GENERAL")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            resourceFilter === "GENERAL"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700/80"
                          }`}
                        >
                          <Globe size={13} />
                          <span>{locale === "en" ? "General Files" : "Bahan Umum"} ({generalResources.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingResources ? (
                    <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800">
                      <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                      <span className="text-xs text-stone-400">
                        {locale === "en" ? "Loading resources..." : "Memuat bahan belajar..."}
                      </span>
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                      <FolderDown className="mx-auto text-stone-600 mb-2" size={32} />
                      <h4 className="text-sm font-bold text-stone-300">
                        {locale === "en" ? "No resources available yet" : "Bahan belajar belum tersedia"}
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        {locale === "en"
                          ? "The instructor will upload supplementary assets and project files here."
                          : "Instruktur akan mengunggah aset tambahan dan file proyek di bagian ini."}
                      </p>
                    </div>
                  ) : resourceFilter === "CHAPTER" ? (
                    currentChapterResources.length === 0 ? (
                      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                        <Layers className="mx-auto text-stone-600 mb-2" size={32} />
                        <h4 className="text-sm font-bold text-stone-300">
                          {locale === "en" ? "No specific files for this chapter" : "Belum Ada Bahan Ajar Khusus Bab Ini"}
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
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
                      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                        <Globe className="mx-auto text-stone-600 mb-2" size={32} />
                        <h4 className="text-sm font-bold text-stone-300">
                          {locale === "en" ? "No general course files" : "Tidak Ada Bahan Belajar Umum"}
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
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
                  <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-stone-400">{t("loading_quiz")}</span>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                    <HelpCircle className="mx-auto text-stone-600 mb-2" size={32} />
                    <h3 className="text-base font-bold text-stone-200">{t("quiz_not_available")}</h3>
                    <p className="text-xs text-stone-400">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                              selectedQuizIdx === idx
                                ? "bg-blue-600 text-white"
                                : "bg-stone-900 text-stone-400 hover:bg-stone-800"
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
                            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-bold text-stone-100">{quiz.title}</h3>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    📘 Bab: {quizSection.title}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Lock size={11} /> Kuis Terkunci
                                  </span>
                                </div>
                                {quiz.description && (
                                  <p className="text-xs text-stone-400 mt-1">{quiz.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Lock Notification Card */}
                            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/30 text-center space-y-4">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                <Lock size={32} />
                              </div>
                              <div className="space-y-1.5 max-w-lg mx-auto">
                                <h4 className="text-base font-bold text-stone-100">
                                  Selesaikan Materi Bab Terlebih Dahulu
                                </h4>
                                <p className="text-xs text-stone-400 leading-relaxed">
                                  Kuis ini dikhususkan untuk menguji pemahaman bab{" "}
                                  <span className="text-amber-300 font-semibold">&ldquo;{quizSection.title}&rdquo;</span>.
                                  Anda harus menyelesaikan seluruh materi di bab ini agar kuis terbuka dan dapat dikerjakan.
                                </p>
                              </div>

                              {/* Progress in this section */}
                              <div className="max-w-md mx-auto p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-stone-400">Progres Pembelajaran Bab Ini:</span>
                                  <span className="text-amber-300 font-bold">
                                    {completedSectionLessonsCount} / {quizSection.lessons.length} Selesai ({Math.round((completedSectionLessonsCount / quizSection.lessons.length) * 100)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
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
                                <span className="text-xs font-semibold text-stone-400 block">
                                  Materi yang belum diselesaikan ({uncompletedSectionLessons.length}):
                                </span>
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                  {uncompletedSectionLessons.map((l) => (
                                    <div
                                      key={l.id}
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <Play size={12} className="text-stone-500 shrink-0" />
                                        <span className="truncate text-stone-200">{l.title}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCurrentLesson(l);
                                          setActiveTab("notes");
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-[11px] font-semibold shrink-0 transition-colors"
                                      >
                                        Pelajari &rarr;
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
                          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-stone-100">{quiz.title}</h3>
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
                                <p className="text-xs text-stone-400 mt-1">{quiz.description}</p>
                              )}
                            </div>

                            {quizSubmitted && (
                              <div
                                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                                  isPassed
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
                                  className={`p-5 rounded-2xl border transition-all ${
                                    quizSubmitted
                                      ? isCorrect
                                        ? "bg-green-950/20 border-green-800/60"
                                        : "bg-red-950/20 border-red-800/60"
                                      : "bg-stone-900 border-stone-800"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {qIndex + 1}
                                    </span>
                                    <div className="space-y-3 flex-1">
                                      <p className="text-sm font-semibold text-stone-100">
                                        {q.question}
                                      </p>

                                      {/* Options */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {q.options.map((opt, optIdx) => {
                                          const isSelected = userAnswer === optIdx;
                                          const isThisCorrect = optIdx === q.correctAnswer;
                                          const label = String.fromCharCode(65 + optIdx);
                                          let optStyle =
                                            "bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800/60";

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
                                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                  isSelected
                                                    ? quizSubmitted
                                                      ? isCorrect
                                                        ? "bg-green-600 text-white"
                                                        : "bg-red-600 text-white"
                                                        : "bg-blue-600 text-white"
                                                    : "bg-stone-800 text-stone-400"
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
                                className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
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
                  <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-stone-400">{t("loading_assignments")}</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
                    <FileCode2 className="mx-auto text-stone-600 mb-2" size={32} />
                    <h3 className="text-base font-bold text-stone-200">{t("no_assignments")}</h3>
                    <p className="text-xs text-stone-400">
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
                          className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden"
                        >
                          <div className="p-5 border-b border-stone-800 flex items-start gap-3">
                            <span className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-stone-100">
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
                              <p className="text-xs text-stone-300 whitespace-pre-line leading-relaxed">
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

                          <div className="p-5 bg-stone-950/40">
                            {isAssignLocked && assignSection ? (
                              <div className="p-6 rounded-xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/30 text-center space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                  <Lock size={24} />
                                </div>
                                <div className="space-y-1.5 max-w-md mx-auto">
                                  <h4 className="text-sm font-bold text-stone-100">
                                    Selesaikan Seluruh Materi Bab Ini Terlebih Dahulu
                                  </h4>
                                  <p className="text-xs text-stone-400 leading-relaxed">
                                    Tugas proyek ini terikat pada bab{" "}
                                    <span className="text-amber-300 font-semibold">&ldquo;{assignSection.title}&rdquo;</span>.
                                    Anda harus menyelesaikan seluruh materi di bab ini terlebih dahulu agar dapat mengumpulkan tugas.
                                  </p>
                                </div>

                                {/* Progress */}
                                <div className="max-w-sm mx-auto p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-stone-400">Progres Pembelajaran Bab:</span>
                                    <span className="text-amber-300 font-bold">
                                      {completedAssignCount} / {assignSection.lessons.length} Selesai ({Math.round((completedAssignCount / assignSection.lessons.length) * 100)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
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
                                  <span className="text-xs font-semibold text-stone-400 block">
                                    Materi yang belum selesai ({uncompletedAssignLessons.length}):
                                  </span>
                                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                    {uncompletedAssignLessons.map((l) => (
                                      <div
                                        key={l.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs"
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <Play size={12} className="text-stone-500 shrink-0" />
                                          <span className="truncate text-stone-200">{l.title}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCurrentLesson(l);
                                            setActiveTab("notes");
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-[11px] font-semibold shrink-0 transition-colors"
                                        >
                                          Pelajari &rarr;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : userSub ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-xs font-bold text-stone-400">
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

                                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs space-y-2">
                                  {userSub.content && (
                                    <div>
                                      <span className="text-stone-400 block mb-1">
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
                                        <p className="font-mono text-stone-200">{userSub.content}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Uploaded File Download */}
                                  {userSub.fileUrl && (
                                    <div className="pt-1">
                                      <span className="text-stone-400 block mb-1">
                                        {t("submitted_file_label")}
                                      </span>
                                      <a
                                        href={userSub.fileUrl}
                                        download={userSub.fileName || "submission"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
                                      >
                                        <Download size={13} className="text-stone-400" />
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
                                    <p className="text-stone-200 leading-relaxed">
                                      {userSub.feedback}
                                    </p>
                                  </div>
                                )}

                                {userSub.status === "REJECTED" && (
                                  <div className="pt-2 space-y-3">
                                    <label htmlFor={"revision-url-" + assignment.id} className="block text-xs font-semibold text-stone-300">{t("submit_revision")}</label>

                                    <input id={"revision-url-" + assignment.id} name={"revisionUrl_" + assignment.id} type="text" placeholder={t("revision_placeholder")} value={submissionUrlInput[assignment.id] || ""}
                                      onChange={(e) =>
                                        setSubmissionUrlInput((prev) => ({
                                          ...prev,
                                          [assignment.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full text-xs px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-hidden focus:border-blue-500"
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
                                          className="text-stone-400 hover:text-red-400 p-1"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-stone-700 hover:bg-stone-900 cursor-pointer text-xs text-stone-400 hover:text-stone-200 transition-colors">
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
                                  <label htmlFor={"assign-url-" + assignment.id} className="block text-xs font-semibold text-stone-300 mb-1">{t("submit_url_placeholder")}</label>
                                  <input id={"assign-url-" + assignment.id} name={"assignUrl_" + assignment.id} type="text" placeholder="https://github.com/username/project..." value={submissionUrlInput[assignment.id] || ""}
                                    onChange={(e) =>
                                      setSubmissionUrlInput((prev) => ({
                                        ...prev,
                                        [assignment.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-hidden focus:border-blue-500"
                                  />
                                </div>

                                {/* Upload File option */}
                                <div>
                                  <label htmlFor={"assign-file-" + assignment.id} className="block text-xs font-semibold text-stone-300 mb-1">{t("upload_file_label")}</label>

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
                                        className="text-stone-400 hover:text-red-400 p-1"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-700 rounded-xl hover:bg-stone-900 cursor-pointer transition-colors text-center">
                                      {uploadingForAssignmentId === assignment.id ? (
                                        <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                                          <Loader2 size={16} className="animate-spin" />
                                          {t("uploading")}
                                        </div>
                                      ) : (
                                        <>
                                          <Upload size={18} className="text-stone-400 mb-1" />
                                          <span className="text-xs font-semibold text-stone-300">
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
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3"
                >
                  <h3 className="text-sm font-bold text-stone-200">
                    {t("post_discussion")}
                  </h3>
                  <label htmlFor="learn-discussion-topic" className="sr-only">Topik Diskusi</label>
                  <textarea id="learn-discussion-topic" name="topicContent" rows={3} value={newTopicText} onChange={(e) => setNewTopicText(e.target.value)}
                    placeholder={t("discussion_placeholder")}
                    className="w-full rounded-xl bg-stone-950 border border-stone-800 p-3 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-hidden focus:border-blue-500"
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
                  <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-xs text-stone-400">
                      {locale === "en" ? "Loading discussions..." : "Memuat diskusi kelas..."}
                    </span>
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map((d) => (
                      <div
                        key={d.id}
                        className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden"
                      >
                        {/* Topic Header & Content */}
                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                                {d.user?.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={d.user.image} alt={d.user.name || "User"} width={32} height={32} loading="eager" style={{ aspectRatio: "1 / 1" }} className="w-full h-full object-cover aspect-square" />
                                ) : (
                                  <UserIcon size={14} className="text-stone-400" />
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-stone-200">
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
                            <span className="text-[11px] text-stone-500">
                              {new Date(d.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-300 pl-10 leading-relaxed whitespace-pre-wrap">
                            {d.content}
                          </p>
                        </div>

                        {/* Replies */}
                        <div className="bg-stone-950/60 border-t border-stone-800/80 p-4 space-y-3">
                          {d.replies.length > 0 && (
                            <div className="space-y-2.5 mb-3">
                              {d.replies.map((reply) => {
                                const isAdmin = reply.user?.role === "ADMIN";
                                return (
                                  <div
                                    key={reply.id}
                                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                                      isAdmin
                                        ? "bg-blue-950/20 border-blue-800/40"
                                        : "bg-stone-900 border-stone-800"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                          {reply.user?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={reply.user.image} alt={reply.user.name || "User"} width={20} height={20} loading="eager" style={{ aspectRatio: "1 / 1" }} className="w-full h-full object-cover aspect-square" />
                                          ) : (
                                            <UserIcon size={10} className="text-stone-400" />
                                          )}
                                        </div>
                                        <span className="font-bold text-stone-200">
                                          {reply.user?.name || (locale === "en" ? "User" : "Pengguna")}
                                        </span>
                                        {isAdmin && (
                                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                                            {locale === "en" ? "Instructor" : "Instruktur"}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-stone-500">
                                        {new Date(reply.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-stone-300 pl-7 leading-relaxed whitespace-pre-wrap">
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
                              className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-hidden focus:border-blue-500"
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
                  <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center text-xs text-stone-500">
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
