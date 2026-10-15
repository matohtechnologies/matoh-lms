"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Plus,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dynamicConfirm, dynamicAlert } from "@/components/ui/dynamic-alert-provider";

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

export function DiscussionManager({ courseId }: { courseId: string }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New discussion thread
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newTopicContent, setNewTopicContent] = useState("");
  const [sendingTopic, setSendingTopic] = useState(false);

  // Replying state per thread: { [discussionId]: string }
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${courseId}/discussions`);
      if (!res.ok) throw new Error("Gagal mengambil data diskusi");
      const data = await res.json();
      setDiscussions(data.discussions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handlePostTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicContent.trim()) return;

    try {
      setSendingTopic(true);
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newTopicContent.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal membuat topik diskusi");
      }

      const { discussion } = await res.json();
      setDiscussions((prev) => [discussion, ...prev]);
      setNewTopicContent("");
      setIsCreatingThread(false);
    } catch (err: unknown) {
      await dynamicAlert({
        title: "Gagal Membuat Topik",
        message: err instanceof Error ? err.message : "Gagal membuat topik diskusi",
        variant: "danger",
      });
    } finally {
      setSendingTopic(false);
    }
  };

  const handleSendReply = async (discussionId: string) => {
    const text = replyInputs[discussionId]?.trim();
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
        throw new Error(d.error || "Gagal mengirim balasan");
      }

      const { reply } = await res.json();
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, replies: [...d.replies, reply] }
            : d
        )
      );

      setReplyInputs((prev) => ({ ...prev, [discussionId]: "" }));
    } catch (err: unknown) {
      await dynamicAlert({
        title: "Gagal Mengirim Balasan",
        message: err instanceof Error ? err.message : "Gagal membalas pesan diskusi",
        variant: "danger",
      });
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Diskusi?",
      message: "Hapus topik diskusi ini beserta seluruh balasannya? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus Diskusi",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/courses/${courseId}/discussions/${discussionId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Gagal menghapus diskusi");
      setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
    } catch (err: unknown) {
      await dynamicAlert({
        title: "Gagal Menghapus Diskusi",
        message: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus diskusi.",
        variant: "danger",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-stone-200">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-stone-500 font-medium">Memuat diskusi kelas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            Forum Diskusi & Tanya Jawab Kelas
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Bantu jawab pertanyaan siswa mengenai materi pembelajaran atau buat pengumuman interaktif.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreatingThread(!isCreatingThread)}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          leftIcon={<Plus size={16} />}
        >
          {isCreatingThread ? "Tutup Form" : "Buat Topik Baru"}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Form Buat Topik Baru */}
      {isCreatingThread && (
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs animate-in fade-in duration-150">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            Kirim Topik / Pengumuman Baru
          </h3>
          <form onSubmit={handlePostTopic} className="space-y-3">
            <textarea
              rows={3}
              required
              placeholder="Tuliskan pertanyaan pengantar atau topik diskusi untuk siswa kelas ini..."
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingThread(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={sendingTopic}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                leftIcon={<Send size={13} />}
              >
                Kirim Topik
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Discussion List */}
      {discussions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-sm font-bold text-stone-900 mb-1">Belum Ada Diskusi</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Diskusi dari siswa dan instruktur akan muncul di sini. Anda dapat langsung menjawab pertanyaan siswa.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreatingThread(true)}
            leftIcon={<Plus size={14} />}
          >
            Mulai Diskusi Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
            >
              {/* Main Discussion Post */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 text-xs font-bold overflow-hidden shrink-0 mt-0.5 border border-stone-200">
                      {d.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.user.image}
                          alt={d.user.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={16} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-900">
                          {d.user?.name || "Pengguna"}
                        </span>
                        {d.user?.role === "ADMIN" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <ShieldCheck size={11} />
                            Admin
                          </span>
                        )}
                        <span className="text-[11px] text-stone-400">
                          {new Date(d.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 mt-2 whitespace-pre-line leading-relaxed">
                        {d.content}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDiscussion(d.id)}
                    className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Hapus Diskusi"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Replies Container */}
              <div className="bg-stone-50/70 border-t border-stone-100 p-4 sm:p-5 space-y-3">
                {d.replies.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {d.replies.map((reply) => {
                      const isAdmin = reply.user?.role === "ADMIN";
                      return (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                            isAdmin
                              ? "bg-blue-50/40 border-blue-200/80"
                              : "bg-white border-stone-200"
                          }`}
                        >
                          <CornerDownRight
                            size={14}
                            className="text-stone-300 mt-1 shrink-0 hidden sm:block"
                          />
                          <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 text-[11px] font-bold overflow-hidden shrink-0 mt-0.5">
                            {reply.user?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={reply.user.image}
                                alt={reply.user.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon size={12} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-stone-900">
                                {reply.user?.name || "Pengguna"}
                              </span>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                                  Instruktur / Admin
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400">
                                {new Date(reply.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-stone-700 mt-1 whitespace-pre-line leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tulis balasan resmi sebagai Admin..."
                    value={replyInputs[d.id] || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({ ...prev, [d.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(d.id);
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    loading={sendingReplyId === d.id}
                    onClick={() => handleSendReply(d.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-xs"
                    leftIcon={<Send size={12} />}
                  >
                    Kirim Balasan
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
