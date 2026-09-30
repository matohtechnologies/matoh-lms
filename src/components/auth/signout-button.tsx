"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  variant?: "dashboard" | "admin" | "navbar";
  callbackUrl?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({
  className,
  variant = "dashboard",
  callbackUrl = "/",
  children,
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
    admin: "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors text-left font-medium",
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(defaultClasses[variant], className)}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin text-stone-400 shrink-0" />
      ) : (
        <LogOut size={16} className="shrink-0" />
      )}
      {children || <span>Keluar</span>}
    </button>
  );
}
