"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function NewsletterForm({ isEn }: { isEn: boolean }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="p-4 rounded-2xl bg-white/20 border border-white/30 text-white text-sm flex items-center justify-center gap-3 backdrop-blur-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
        <span className="font-medium">
          {isEn
            ? "Thank you! You are now subscribed to our weekly research digest."
            : "Terima kasih! Anda telah terdaftar dalam buletin riset mingguan kami."}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={isEn ? "Enter your email address" : "Masukkan alamat email Anda"}
        className="flex-1 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-white/80 shadow-xs"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-2 hover:scale-[1.02]"
      >
        <span>{isEn ? "Subscribe" : "Berlangganan"}</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
