"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  X,
  ExternalLink,
  RefreshCw,
  Loader2,
  Inbox,
  Filter,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dynamicConfirm } from "@/components/ui/dynamic-alert-provider";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  institution?: string | null;
  message: string;
  isRead: boolean;
  repliedAt?: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
}

export function InquiriesClient() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const handleCopyEmail = (email: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const getGmailUrl = (email: string, category: string, name: string) => {
    const subject = `Tanggapan Konsultasi Matoh Technologies: ${category}`;
    const body = `Halo ${name},\n\nTerima kasih telah menghubungi PT. Matoh Technologies Indonesia.\nMenanggapi pertanyaan Anda mengenai ${category}:\n\n...\n\nSalam hangat,\nTim PT. Matoh Technologies Indonesia\nhttps://www.matohtechnologies.com`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Gagal mengambil data");
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setStats(data.stats || { total: 0, unread: 0, read: 0 });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat pesan");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchInquiries]);

  const handleToggleRead = async (inquiry: ContactInquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(inquiry.id);
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !inquiry.isRead }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status");

      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiry.id ? { ...item, isRead: !item.isRead } : item
        )
      );

      setStats((prev) => ({
        ...prev,
        unread: inquiry.isRead ? prev.unread + 1 : Math.max(0, prev.unread - 1),
        read: inquiry.isRead ? Math.max(0, prev.read - 1) : prev.read + 1,
      }));

      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry((prev) => prev ? { ...prev, isRead: !inquiry.isRead } : null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (inquiryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await dynamicConfirm({
      title: "Hapus Pesan Konsultasi",
      message: "Apakah Anda yakin ingin menghapus pesan ini secara permanen?",
      confirmText: "Hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setActionLoadingId(inquiryId);
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus pesan");

      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      fetchInquiries();

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pesan");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDetailModal = async (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    // Auto mark as read when opened if unread
    if (!inquiry.isRead) {
      handleToggleRead(inquiry);
    }
  };

  const getCleanPhone = (phone?: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return clean;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            Pesan Konsultasi & Bantuan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola pertanyaan dan konsultasi yang masuk dari formulir website secara terpusat.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchInquiries()}
          className="self-start sm:self-auto gap-2 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pesan Masuk
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {stats.total}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Belum Dibaca
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {stats.unread}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Sudah Ditinjau
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {stats.read}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === "unread"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Belum Dibaca</span>
            {stats.unread > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filter === "unread" ? "bg-white text-amber-600" : "bg-amber-100 text-amber-800"
              }`}>
                {stats.unread}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter("read")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "read"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sudah Dibaca ({stats.read})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="inquiry-search"
            name="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, hp, pesan..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Inquiry List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-xs">Memuat daftar pesan...</p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchInquiries()}
              className="mt-3 cursor-pointer text-xs"
            >
              Coba Muat Ulang
            </Button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Belum Ada Pesan Masuk</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {search
                  ? `Tidak ditemukan pesan dengan kata kunci "${search}".`
                  : filter === "unread"
                  ? "Semua pesan konsultasi sudah dibaca dan ditindaklanjuti."
                  : "Pesan yang dikirim oleh pengunjung melalui formulir kontak akan tampil di sini."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => {
              const cleanPhone = getCleanPhone(inquiry.phone);
              const dateFormatted = new Date(inquiry.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={inquiry.id}
                  onClick={() => openDetailModal(inquiry)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                    !inquiry.isRead ? "bg-blue-50/30 font-medium" : ""
                  }`}
                >
                  {/* Left Column: Status indicator & Sender Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="pt-1 shrink-0">
                      {!inquiry.isRead ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                        </span>
                      ) : (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm ${!inquiry.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                          {inquiry.name}
                        </span>
                        <Badge
                          variant="info"
                          className="text-[11px] font-semibold bg-blue-50 text-blue-700"
                        >
                          {inquiry.category}
                        </Badge>
                        {inquiry.institution && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                            <Building size={11} className="text-slate-400" />
                            {inquiry.institution}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 pr-2">
                        {inquiry.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 hover:text-blue-600">
                          <Mail size={12} /> {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1 hover:text-emerald-600">
                            <Phone size={12} /> {inquiry.phone}
                          </span>
                        )}
                        <span>•</span>
                        <span>{dateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div
                    className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Quick WhatsApp Reply */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Halo ${inquiry.name}, kami dari tim PT. Matoh Technologies Indonesia menanggapi pesan konsultasi Anda mengenai "${inquiry.category}"...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Balas via WhatsApp"
                      >
                        <Phone size={14} className="text-emerald-600" />
                      </a>
                    )}

                    {/* Quick Gmail Reply */}
                    <a
                      href={getGmailUrl(inquiry.email, inquiry.category, inquiry.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                      title="Buka & Balas di Gmail"
                    >
                      <Mail size={14} className="text-blue-600" />
                    </a>

                    {/* Copy Email */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(inquiry.email, inquiry.id, e)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={copiedEmailId === inquiry.id ? "Email Disalin!" : "Salin Alamat Email"}
                    >
                      {copiedEmailId === inquiry.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {/* Toggle Read/Unread */}
                    <button
                      type="button"
                      disabled={actionLoadingId === inquiry.id}
                      onClick={(e) => handleToggleRead(inquiry, e)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={inquiry.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                    >
                      {inquiry.isRead ? <Clock size={14} /> : <Check size={14} className="text-blue-600" />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={actionLoadingId === inquiry.id}
                      onClick={(e) => handleDelete(inquiry.id, e)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Pesan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Detail Pesan Konsultasi
                </span>
                <h3
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Email Pengirim</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                >
                  <Mail size={13} /> {selectedInquiry.email}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">WhatsApp / HP</span>
                {selectedInquiry.phone ? (
                  <a
                    href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1.5"
                  >
                    <Phone size={13} /> {selectedInquiry.phone}
                  </a>
                ) : (
                  <span className="text-slate-500 font-medium">Tidak dicantumkan</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Topik Kebutuhan</span>
                <span className="font-bold text-slate-800">{selectedInquiry.category}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Instansi / UMKM</span>
                <span className="font-bold text-slate-800">
                  {selectedInquiry.institution || "-"}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Isi Pesan / Pertanyaan
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Diterima pada:{" "}
                {new Date(selectedInquiry.createdAt).toLocaleString("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleRead(selectedInquiry)}
                  className="text-xs text-slate-600 cursor-pointer"
                >
                  {selectedInquiry.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                >
                  <Trash2 size={13} className="mr-1" /> Hapus
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleCopyEmail(selectedInquiry.email, selectedInquiry.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  {copiedEmailId === selectedInquiry.id ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-700">Email Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Salin Email</span>
                    </>
                  )}
                </button>

                <a
                  href={getGmailUrl(selectedInquiry.email, selectedInquiry.category, selectedInquiry.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Mail size={14} />
                  <span>Buka di Gmail</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}?text=${encodeURIComponent(
                      `Halo ${selectedInquiry.name}, kami dari tim PT. Matoh Technologies Indonesia menanggapi pesan konsultasi Anda mengenai "${selectedInquiry.category}"...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Phone size={14} />
                    <span>Balas WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
