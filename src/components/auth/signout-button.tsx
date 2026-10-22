"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "dashboard" | "admin" | "navbar" | "icon" | "danger";
  callbackUrl?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({
  className,
  variant = "dashboard",
  callbackUrl = "/",
  children,
  ...props
}: SignOutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsPending(true);
      await signOut({ redirect: false });
      window.location.href = callbackUrl;
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = callbackUrl;
    }
  };

  const defaultClasses = {
    navbar: "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left",
    dashboard: "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium",
    admin: "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left font-medium",
    icon: "flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 bg-white shadow-2xs transition-colors shrink-0",
    danger: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-all shadow-2xs hover:border-red-300 disabled:opacity-60",
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(defaultClasses[variant], className)}
      {...props}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin text-stone-400 shrink-0" />
      ) : (
        <LogOut size={16} className="shrink-0" />
      )}
      {children !== undefined ? (
        children
      ) : variant === "icon" ? (
        <span className="sr-only">Keluar</span>
      ) : (
        <span>Keluar</span>
      )}
    </button>
  );
}
