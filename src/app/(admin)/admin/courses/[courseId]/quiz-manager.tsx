"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
  order: number;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  passingScore: number;
  questions: QuizQuestion[];
  attempts?: {
    id: string;
    score: number;
    passed: boolean;
    user?: { name: string | null; email: string | null } | null;
  }[];
}

export function QuizManager({ courseId }: { courseId: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Create Quiz Modal State
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Add Question Modal State
  const [selectedQuizIdForQuestion, setSelectedQuizIdForQuestion] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${courseId}/quizzes`);
      if (!res.ok) throw new Error("Gagal mengambil kuis");
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      if (data.quizzes?.length > 0 && !expandedQuizId) {
        setExpandedQuizId(data.quizzes[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [courseId, expandedQuizId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Create quiz handler
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    try {
      setSavingQuiz(true);
      const res = await fetch(`/api/admin/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle.trim(),
          description: quizDescription.trim() || undefined,
          passingScore: Number(passingScore) || 70,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal membuat kuis");
      }

      const { quiz } = await res.json();
      setQuizzes((prev) => [...prev, { ...quiz, questions: [] }]);
      setExpandedQuizId(quiz.id);
      setIsCreatingQuiz(false);
      setQuizTitle("");
      setQuizDescription("");
      setPassingScore(70);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal membuat kuis");
    } finally {
      setSavingQuiz(false);
    }
  };

  // Delete quiz handler
  const handleDeleteQuiz = async (quizId: string, title: string) => {
    if (!confirm(`Hapus kuis "${title}" beserta semua soalnya?`)) return;

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus kuis");
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kuis");
    }
  };

  // Add question handler
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizIdForQuestion) return;

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      alert("Harap isi minimal 2 pilihan jawaban");
      return;
    }
    if (correctAnswer >= filteredOptions.length) {
      alert("Pilihan jawaban benar tidak valid");
      return;
    }

    try {
      setSavingQuestion(true);
      const res = await fetch(
        `/api/admin/courses/${courseId}/quizzes/${selectedQuizIdForQuestion}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: questionText.trim(),
            options: filteredOptions,
            correctAnswer,
            explanation: explanation.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menambahkan soal");
      }

      const { question } = await res.json();
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === selectedQuizIdForQuestion
            ? { ...q, questions: [...q.questions, question] }
            : q
        )
      );

      setSelectedQuizIdForQuestion(null);
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      setExplanation("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menambahkan soal");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete question handler
  const handleDeleteQuestion = async (quizId: string, questionId: string) => {
    if (!confirm("Hapus soal kuis ini?")) return;

    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus soal");
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, questions: q.questions.filter((item) => item.id !== questionId) }
            : q
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus soal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-stone-200">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-stone-500 font-medium">Memuat kuis kelas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <HelpCircle size={18} className="text-blue-600" />
            Manajemen Kuis & Latihan
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Buat tes pilihan ganda untuk menguji pemahaman siswa setelah materi selesai.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreatingQuiz(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          leftIcon={<Plus size={16} />}
        >
          Buat Kuis Baru
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <HelpCircle size={28} />
          </div>
          <h3 className="text-sm font-bold text-stone-900 mb-1">Belum Ada Kuis</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Tambahkan kuis evaluasi untuk memverifikasi kelulusan siswa dan menguji penguasaan materi mereka.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreatingQuiz(true)}
            leftIcon={<Plus size={14} />}
          >
            Tambah Kuis Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, qIdx) => {
            const isExpanded = expandedQuizId === quiz.id;
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Quiz Header Item */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 bg-stone-50/50">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-stone-900">{quiz.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          KKM: {quiz.passingScore}%
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                          {quiz.questions.length} Soal
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {quiz.attempts?.length || 0} Siswa Selesai
                        </span>
                      </div>
                      {quiz.description && (
                        <p className="text-xs text-stone-500 mt-1">{quiz.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setSelectedQuizIdForQuestion(quiz.id);
                        setQuestionText("");
                        setOptions(["", "", "", ""]);
                        setCorrectAnswer(0);
                        setExplanation("");
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs py-1.5 h-auto"
                      leftIcon={<Plus size={13} />}
                    >
                      Tambah Soal
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Kuis"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Questions Details */}
                {isExpanded && (
                  <div className="p-5 space-y-4">
                    {quiz.questions.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <BookOpen size={24} className="mx-auto text-stone-400 mb-2" />
                        <p className="text-xs text-stone-500 font-medium">Belum ada soal pada kuis ini</p>
                        <button
                          type="button"
                          onClick={() => setSelectedQuizIdForQuestion(quiz.id)}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                        >
                          + Tambah Soal Pertama
                        </button>
                      </div>
                    ) : (
                      quiz.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border border-stone-200 hover:border-blue-200 transition-colors bg-white relative group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded bg-stone-100 text-stone-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="space-y-2.5">
                                <h4 className="text-sm font-semibold text-stone-800 leading-snug">
                                  {q.question}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, optIdx) => {
                                    const isCorrect = optIdx === q.correctAnswer;
                                    const label = String.fromCharCode(65 + optIdx);
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border ${
                                          isCorrect
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                            : "bg-stone-50 border-stone-200 text-stone-600"
                                        }`}
                                      >
                                        <span
                                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                            isCorrect
                                              ? "bg-emerald-600 text-white"
                                              : "bg-stone-200 text-stone-600"
                                          }`}
                                        >
                                          {label}
                                        </span>
                                        <span className="flex-1 truncate">{opt}</span>
                                        {isCorrect && (
                                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {q.explanation && (
                                  <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-lg text-[11px] text-amber-800">
                                    <Sparkles size={13} className="text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="font-bold">Pembahasan: </span>
                                      {q.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                              className="text-stone-300 hover:text-red-600 p-1 rounded transition-colors group-hover:opacity-100"
                              title="Hapus Soal"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Dialog: Buat Kuis Baru */}
      {isCreatingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Tambah Kuis Baru</h3>
            <p className="text-xs text-stone-500 mb-4">
              Tentukan judul kuis dan nilai ambang batas kelulusan siswa.
            </p>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Kuis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kuis Akhir Modul 1: Dasar TypeScript"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi / Petunjuk (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Petunjuk singkat sebelum mengerjakan kuis..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nilai Minimal Kelulusan (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingQuiz(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={savingQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Kuis
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Dialog: Tambah Soal Kuis */}
      {selectedQuizIdForQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900 mb-1">Tambah Soal Pilihan Ganda</h3>
            <p className="text-xs text-stone-500 mb-4">
              Masukkan pertanyaan, beberapa opsi jawaban, dan pilih opsi yang benar.
            </p>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan soal pertanyaan di sini..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Pilihan Jawaban (Tandai yang benar) <span className="text-red-500">*</span>
                  </label>
                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setOptions([...options, ""])}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      + Tambah Pilihan
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    const isCorrect = correctAnswer === idx;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="correctAnswerRadio"
                            checked={isCorrect}
                            onChange={() => setCorrectAnswer(idx)}
                            className="text-blue-600 focus:ring-blue-500 accent-blue-600"
                          />
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {label}
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={`Pilihan ${label}...`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx] = e.target.value;
                            setOptions(newOpts);
                          }}
                          className={`flex-1 text-xs px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50/30"
                              : "border-stone-300"
                          }`}
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = options.filter((_, i) => i !== idx);
                              setOptions(newOpts);
                              if (correctAnswer >= newOpts.length) {
                                setCorrectAnswer(0);
                              }
                            }}
                            className="text-stone-300 hover:text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pembahasan / Penjelasan Jawaban (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mengapa opsi ini benar? Jelaskan konsepnya kepada siswa..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuizIdForQuestion(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={savingQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Soal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
