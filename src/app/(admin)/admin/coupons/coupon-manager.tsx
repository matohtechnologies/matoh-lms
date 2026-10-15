"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  Percent,
  Coins,
  ShieldAlert,
  Loader2,
  Clock,
  ArrowRight,
  UserCheck,
  Globe,
  Tag,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dynamicConfirm } from "@/components/ui/dynamic-alert-provider";

export interface CourseOption {
  id: string;
  title: string;
  slug: string;
  price?: number;
}

export interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

export interface CouponUsageItem {
  id: string;
  couponId: string;
  userId: string;
  orderId?: string | null;
  usedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  maxUsage?: number | null;
  usedCount: number;
  maxUsagePerUser?: number | null;
  courseId?: string | null;
  allowedEmails?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: CourseOption | null;
  usages?: CouponUsageItem[];
  _count?: {
    usages: number;
    orders: number;
  };
}

interface CouponManagerProps {
  initialCoupons?: CouponItem[];
  courses?: CourseOption[];
  availableUsers?: UserOption[];
}

export function CouponManager({
  initialCoupons = [],
  courses: initialCourses = [],
  availableUsers: initialAvailableUsers = [],
}: CouponManagerProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [courses, setCourses] = useState<CourseOption[]>(initialCourses);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>(initialAvailableUsers);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State: Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [maxUsagePerUser, setMaxUsagePerUser] = useState("1");
  const [courseTargetType, setCourseTargetType] = useState<"ALL" | "SPECIFIC">("ALL");
  const [targetCourseId, setTargetCourseId] = useState("");
  const [userRestrictionType, setUserRestrictionType] = useState<"ALL" | "RESTRICTED">("ALL");
  const [allowedEmailsInput, setAllowedEmailsInput] = useState("");
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Detail / Usage History Modal
  const [viewingUsageCoupon, setViewingUsageCoupon] = useState<CouponItem | null>(null);
  const [loadingUsageDetails, setLoadingUsageDetails] = useState(false);
  const [usageDetails, setUsageDetails] = useState<CouponUsageItem[]>([]);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (courseFilter !== "ALL") params.set("courseId", courseFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil daftar kupon");
      const data = await res.json();
      setCoupons(data.coupons || []);
      if (data.courses) setCourses(data.courses);
      if (data.availableUsers) setAvailableUsers(data.availableUsers);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinPurchase("");
    setMaxDiscount("");
    setMaxUsage("");
    setMaxUsagePerUser("1");
    setCourseTargetType("ALL");
    setTargetCourseId(courses[0]?.id || "");
    setUserRestrictionType("ALL");
    setAllowedEmailsInput("");
    setExpiresAtInput("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: CouponItem) => {
    setEditingCoupon(item);
    setCode(item.code);
    setDiscountType(item.discountType);
    setDiscountValue(item.discountValue.toString());
    setMinPurchase(item.minPurchase ? item.minPurchase.toString() : "");
    setMaxDiscount(item.maxDiscount ? item.maxDiscount.toString() : "");
    setMaxUsage(item.maxUsage ? item.maxUsage.toString() : "");
    setMaxUsagePerUser(item.maxUsagePerUser ? item.maxUsagePerUser.toString() : "1");
    
    if (item.courseId) {
      setCourseTargetType("SPECIFIC");
      setTargetCourseId(item.courseId);
    } else {
      setCourseTargetType("ALL");
      setTargetCourseId(courses[0]?.id || "");
    }

    if (item.allowedEmails && item.allowedEmails.trim()) {
      setUserRestrictionType("RESTRICTED");
      setAllowedEmailsInput(item.allowedEmails);
    } else {
      setUserRestrictionType("ALL");
      setAllowedEmailsInput("");
    }

    if (item.expiresAt) {
      const d = new Date(item.expiresAt);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setExpiresAtInput(isoLocal);
    } else {
      setExpiresAtInput("");
    }

    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  // Save Coupon (Create / Update)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue.trim()) {
      showNotification("error", "Kode kupon dan besaran diskon wajib diisi");
      return;
    }

    if (courseTargetType === "SPECIFIC" && !targetCourseId) {
      showNotification("error", "Pilih kelas target untuk kupon khusus kelas ini");
      return;
    }

    if (userRestrictionType === "RESTRICTED" && !allowedEmailsInput.trim()) {
      showNotification("error", "Masukkan minimal 1 alamat email pengguna yang diizinkan");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        maxUsage: maxUsage ? parseInt(maxUsage, 10) : null,
        maxUsagePerUser: maxUsagePerUser ? parseInt(maxUsagePerUser, 10) : 1,
        courseId: courseTargetType === "SPECIFIC" ? targetCourseId : null,
        allowedEmails: userRestrictionType === "RESTRICTED" ? allowedEmailsInput.trim() : null,
        expiresAt: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
        isActive,
      };

      if (editingCoupon) {
        // Update
        const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui kupon");

        showNotification("success", `Kupon "${data.coupon.code}" berhasil diperbarui`);
      } else {
        // Create
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat kupon baru");

        showNotification("success", `Kupon "${data.coupon.code}" berhasil dibuat`);
      }

      setIsModalOpen(false);
      setEditingCoupon(null);
      loadData();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (item: CouponItem) => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Kupon Diskon?",
      message: `Hapus kupon "${item.code}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Kupon",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/coupons/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menghapus kupon");
      }
      showNotification("success", `Kupon "${item.code}" berhasil dihapus`);
      loadData();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus kupon");
    }
  };

  // View Usage Details
  const handleOpenUsageModal = async (item: CouponItem) => {
    setViewingUsageCoupon(item);
    setUsageDetails([]);
    setLoadingUsageDetails(true);

    try {
      const res = await fetch(`/api/admin/coupons/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setUsageDetails(data.coupon.usages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsageDetails(false);
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to append a user email from registered users list
  const handleAddUserEmail = (email: string) => {
    const currentEmails = allowedEmailsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!currentEmails.includes(email.toLowerCase())) {
      const updated = currentEmails.length > 0 ? `${allowedEmailsInput.trim()}, ${email}` : email;
      setAllowedEmailsInput(updated);
    }
  };

  // Stats calculation
  const totalActiveCoupons = coupons.filter((c) => c.isActive).length;
  const totalCourseSpecific = coupons.filter((c) => !!c.courseId).length;
  const totalUserRestricted = coupons.filter((c) => !!(c.allowedEmails && c.allowedEmails.trim())).length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Ticket size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Manajemen Kupon Diskon
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Kelola kupon promo, atur batas kelas tertentu, dan batasi akses ke pengguna terpilih.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus size={16} />}
          className="shadow-xs"
        >
          Buat Kupon Baru
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 transition-all animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span className="font-medium text-xs sm:text-sm">{notification.text}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kupon</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{coupons.length}</span>
            <span className="text-xs text-emerald-600 font-semibold">{totalActiveCoupons} aktif</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khusus Kelas</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalCourseSpecific}</span>
            <span className="text-xs text-slate-400">kupon terikat</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khusus User</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalUserRestricted}</span>
            <span className="text-xs text-purple-600 font-semibold">akses terbatas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Terpakai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalRedemptions}</span>
            <span className="text-xs text-slate-400">kali klaim</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode kupon atau email pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 shrink-0" />
          
          {/* Target Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="GLOBAL">🌐 Kupon Global (Semua Kelas)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                📘 Khusus: {c.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="EXPIRED">Kedaluwarsa</option>
          </select>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={24} />
          <span className="text-xs text-slate-400">Memuat data kupon...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Ticket size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Tidak Ada Kupon</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Belum ada kupon diskon yang sesuai dengan pencarian atau filter yang Anda pilih.
          </p>
          <Button type="button" onClick={handleOpenCreateModal} leftIcon={<Plus size={14} />}>
            Buat Kupon Pertama
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Kode Kupon</th>
                  <th className="py-3 px-4">Nilai Diskon</th>
                  <th className="py-3 px-4">Target Kursus</th>
                  <th className="py-3 px-4">Hak Akses User</th>
                  <th className="py-3 px-4 text-center">Penggunaan</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((item) => {
                  const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                  const isQuotaExceeded = !!(item.maxUsage && item.usedCount >= item.maxUsage);
                  const allowedList = item.allowedEmails
                    ? item.allowedEmails
                        .split(/[\n,;]+/)
                        .map((e) => e.trim())
                        .filter(Boolean)
                    : [];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {item.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Salin Kode Kupon"
                          >
                            {copiedCode === item.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {item.discountType === "PERCENTAGE" ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-mono">
                              <Percent size={11} />
                              {item.discountValue}%
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                              Rp {item.discountValue.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                        {item.maxDiscount && item.discountType === "PERCENTAGE" && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Maks. Rp {item.maxDiscount.toLocaleString("id-ID")}
                          </div>
                        )}
                        {item.minPurchase && item.minPurchase > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Min. Rp {item.minPurchase.toLocaleString("id-ID")}
                          </div>
                        )}
                      </td>

                      {/* Target Course */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {item.course ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[11px] truncate max-w-full"
                            title={item.course.title}
                          >
                            <BookOpen size={12} className="shrink-0 text-indigo-500" />
                            <span className="truncate">{item.course.title}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                            <Globe size={12} className="text-slate-500" />
                            <span>Semua Kelas</span>
                          </div>
                        )}
                      </td>

                      {/* User Whitelist Restriction */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {allowedList.length > 0 ? (
                          <div className="space-y-1">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 font-semibold text-[11px]"
                              title={`Daftar Email: ${allowedList.join(", ")}`}
                            >
                              <UserCheck size={12} className="text-purple-600" />
                              <span>{allowedList.length} User Terpilih</span>
                            </span>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={allowedList.join(", ")}>
                              {allowedList.slice(0, 2).join(", ")}
                              {allowedList.length > 2 && ` +${allowedList.length - 2} lainnya`}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 text-[11px]">
                            <Users size={12} className="text-slate-400" />
                            <span>Siapa Saja (Publik)</span>
                          </span>
                        )}
                      </td>

                      {/* Usage Count & Quota */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenUsageModal(item)}
                          className="hover:underline text-slate-800"
                        >
                          <span className="font-bold font-mono">
                            {item.usedCount}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {item.maxUsage ? ` / ${item.maxUsage}` : " (bebas)"}
                          </span>
                        </button>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.maxUsagePerUser ? `${item.maxUsagePerUser}x / user` : "1x / user"}
                        </div>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        {item.expiresAt ? (
                          <div className={`flex items-center gap-1 text-[11px] ${isExpired ? "text-red-500 font-semibold" : "text-slate-600"}`}>
                            <Calendar size={12} className="shrink-0" />
                            <span>
                              {new Date(item.expiresAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Tanpa Batas</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {!item.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Nonaktif
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                            Kedaluwarsa
                          </span>
                        ) : isQuotaExceeded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Penuh
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenUsageModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Riwayat Penggunaan"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Kupon"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Kupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COUPON */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCoupon ? "Edit Kupon Diskon" : "Buat Kupon Diskon Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur kode promo, target kelas tertentu, dan batas pengguna yang berhak mengklaim.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Kode Kupon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Kupon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Ticket size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Misal: MATOHPROMO50, VIP-FRONTEND"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tipe & Nilai Diskon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Diskon <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Besaran Diskon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={discountType === "PERCENTAGE" ? "Misal: 50" : "Misal: 50000"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {discountType === "PERCENTAGE" ? "%" : "Rp"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Batasan Nilai (Maksimal Diskon & Minimal Pembelian) */}
              <div className="grid grid-cols-2 gap-3">
                {discountType === "PERCENTAGE" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Maksimal Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Opsional, misal: 200000"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimal Belanja (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Opsional, misal: 100000"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maksimal Pemakaian / Akun
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Default: 1x per akun"
                    value={maxUsagePerUser}
                    onChange={(e) => setMaxUsagePerUser(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* TARGET KELAS TERTENTU (SESUAI REQUEST USER) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Target Kursus / Kelas</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCourseTargetType("ALL")}
                    className={`py-2 px-3 rounded-lg border text-left font-semibold transition-all ${
                      courseTargetType === "ALL"
                        ? "bg-white border-blue-600 text-blue-700 shadow-2xs"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    🌐 Semua Kelas (Global)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCourseTargetType("SPECIFIC")}
                    className={`py-2 px-3 rounded-lg border text-left font-semibold transition-all ${
                      courseTargetType === "SPECIFIC"
                        ? "bg-white border-blue-600 text-blue-700 shadow-2xs"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    📘 Hanya Kelas Tertentu
                  </button>
                </div>

                {courseTargetType === "SPECIFIC" && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pilih Kelas yang Berhak Menggunakan Kupon Ini:
                    </label>
                    <select
                      value={targetCourseId}
                      onChange={(e) => setTargetCourseId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Kupon ini akan ditolak jika digunakan untuk membeli kelas lain di luar kelas ini.
                    </p>
                  </div>
                )}
              </div>

              {/* BATASAN PENGGUNA TERTENTU (SESUAI REQUEST USER) */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">Batasan Pengguna (Hanya User Tertentu)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setUserRestrictionType("ALL")}
                    className={`py-2 px-3 rounded-lg border text-left font-semibold transition-all ${
                      userRestrictionType === "ALL"
                        ? "bg-white border-purple-600 text-purple-700 shadow-2xs"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    👥 Siapa Saja (Publik)
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRestrictionType("RESTRICTED")}
                    className={`py-2 px-3 rounded-lg border text-left font-semibold transition-all ${
                      userRestrictionType === "RESTRICTED"
                        ? "bg-white border-purple-600 text-purple-700 shadow-2xs"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    👤 Khusus User Terpilih
                  </button>
                </div>

                {userRestrictionType === "RESTRICTED" && (
                  <div className="pt-2 space-y-2 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Daftar Email User yang Diizinkan (pisahkan dengan koma atau baris baru):
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="contoh: budi@gmail.com, siti@gmail.com, student@matoh.id"
                        value={allowedEmailsInput}
                        onChange={(e) => setAllowedEmailsInput(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-purple-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Quick User Picker Helper */}
                    {availableUsers.length > 0 && (
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          Klik untuk cepat menambahkan user terdaftar:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                          {availableUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleAddUserEmail(u.email)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center gap-1"
                            >
                              <span>+</span>
                              <span>{u.name || u.email}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-purple-600">
                      ℹ️ Saat checkout, sistem memverifikasi login pengguna. Pengguna yang email-nya tidak ada dalam daftar di atas otomatis ditolak.
                    </p>
                  </div>
                )}
              </div>

              {/* Total Kuota & Masa Berlaku */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Kuota Klaim
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Kosongkan jika bebas"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimal kali kupon bisa digunakan</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Waktu Kedaluwarsa
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAtInput}
                    onChange={(e) => setExpiresAtInput(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Kosongkan jika aktif selamanya</p>
                </div>
              </div>

              {/* Status Aktif */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Status Kupon Aktif</span>
                  <p className="text-[10px] text-slate-400">Nonaktifkan untuk sementara jika tidak ingin kupon dipakai</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Batal
                </Button>
                <Button type="submit" loading={saving}>
                  {editingCoupon ? "Simpan Perubahan" : "Buat Kupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT PENGGUNAAN KUPON */}
      {viewingUsageCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {viewingUsageCoupon.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({viewingUsageCoupon.usedCount} kali digunakan)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Riwayat user yang telah menukarkan kupon ini saat checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingUsageCoupon(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {loadingUsageDetails ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={24} />
                <span className="text-xs text-slate-400">Memuat riwayat penggunaan...</span>
              </div>
            ) : usageDetails.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-1">
                <Clock size={28} className="mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">Belum Ada Penggunaan</p>
                <p className="text-[11px]">Kupon ini belum pernah digunakan oleh siswa mana pun.</p>
              </div>
            ) : (
              <div className="space-y-2 divide-y divide-slate-100">
                {usageDetails.map((usage) => (
                  <div key={usage.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{usage.user?.name || "Pengguna"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{usage.user?.email}</div>
                      {usage.orderId && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Order: {usage.orderId}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 text-right">
                      {new Date(usage.usedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setViewingUsageCoupon(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
