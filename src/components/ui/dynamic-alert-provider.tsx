"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  Trash2,
} from "lucide-react";

export type AlertVariant = "danger" | "warning" | "success" | "info";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: AlertVariant;
  icon?: "trash" | "alert" | "check" | "info";
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: AlertVariant;
}

type DialogState =
  | {
      isOpen: true;
      mode: "confirm";
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      variant: AlertVariant;
      icon?: string;
      resolve: (value: boolean) => void;
    }
  | {
      isOpen: true;
      mode: "alert";
      title: string;
      message: string;
      confirmText: string;
      variant: AlertVariant;
      resolve: () => void;
    }
  | {
      isOpen: false;
    };

// Global handlers for calling outside hooks
let globalShowConfirm: ((options: ConfirmOptions) => Promise<boolean>) | null = null;
let globalShowAlert: ((options: AlertOptions) => Promise<void>) | null = null;

export function dynamicConfirm(options: ConfirmOptions | string): Promise<boolean> {
  if (typeof options === "string") {
    options = { message: options };
  }
  if (globalShowConfirm) {
    return globalShowConfirm(options);
  }
  // Fallback if provider is not mounted yet
  return Promise.resolve(window.confirm(options.message));
}

export function dynamicAlert(options: AlertOptions | string): Promise<void> {
  if (typeof options === "string") {
    options = { message: options };
  }
  if (globalShowAlert) {
    return globalShowAlert(options);
  }
  // Fallback if provider is not mounted yet
  window.alert(options.message);
  return Promise.resolve();
}

interface AlertContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  success: (message: string, title?: string) => Promise<void>;
  error: (message: string, title?: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType>({
  confirm: dynamicConfirm,
  alert: dynamicAlert,
  success: (msg, title) => dynamicAlert({ message: msg, title: title ?? "Berhasil", variant: "success" }),
  error: (msg, title) => dynamicAlert({ message: msg, title: title ?? "Terjadi Kesalahan", variant: "danger" }),
});

export function useAlert() {
  return useContext(AlertContext);
}

export function DynamicAlertProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        mode: "confirm",
        title: options.title || "Konfirmasi Tindakan",
        message: options.message,
        confirmText: options.confirmText || "Konfirmasi",
        cancelText: options.cancelText || "Batal",
        variant: options.variant || "warning",
        icon: options.icon,
        resolve: (val: boolean) => {
          setDialogState({ isOpen: false });
          resolve(val);
        },
      });
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        mode: "alert",
        title:
          options.title ||
          (options.variant === "success"
            ? "Berhasil"
            : options.variant === "danger"
            ? "Terjadi Kesalahan"
            : options.variant === "warning"
            ? "Perhatian"
            : "Informasi"),
        message: options.message,
        confirmText: options.confirmText || "Mengerti",
        variant: options.variant || "info",
        resolve: () => {
          setDialogState({ isOpen: false });
          resolve();
        },
      });
    });
  }, []);

  useEffect(() => {
    globalShowConfirm = showConfirm;
    globalShowAlert = showAlert;
    return () => {
      globalShowConfirm = null;
      globalShowAlert = null;
    };
  }, [showConfirm, showAlert]);

  // Handle escape key
  useEffect(() => {
    if (!dialogState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dialogState.mode === "confirm") {
          dialogState.resolve(false);
        } else {
          dialogState.resolve();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogState]);

  const contextValue: AlertContextType = {
    confirm: (opts) => showConfirm(typeof opts === "string" ? { message: opts } : opts),
    alert: (opts) => showAlert(typeof opts === "string" ? { message: opts } : opts),
    success: (msg, title) =>
      showAlert({ message: msg, title: title ?? "Berhasil", variant: "success" }),
    error: (msg, title) =>
      showAlert({ message: msg, title: title ?? "Terjadi Kesalahan", variant: "danger" }),
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {mounted && dialogState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          {/* Backdrop with frosted glass effect */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (dialogState.mode === "confirm") {
                dialogState.resolve(false);
              } else {
                dialogState.resolve();
              }
            }}
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200/90 z-10 transform scale-100 animate-in zoom-in-95 duration-200 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X Button */}
            <button
              type="button"
              onClick={() => {
                if (dialogState.mode === "confirm") {
                  dialogState.resolve(false);
                } else {
                  dialogState.resolve();
                }
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>

            {/* Header Icon + Halo Aura */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  dialogState.variant === "danger"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : dialogState.variant === "warning"
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : dialogState.variant === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                {dialogState.variant === "danger" ? (
                  dialogState.mode === "confirm" && dialogState.icon === "trash" ? (
                    <Trash2 size={22} />
                  ) : (
                    <XCircle size={22} />
                  )
                ) : dialogState.variant === "warning" ? (
                  <AlertTriangle size={22} />
                ) : dialogState.variant === "success" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Info size={22} />
                )}
              </div>

              <div className="min-w-0 pr-4">
                <h3
                  className="text-base sm:text-lg font-bold text-stone-900 leading-snug tracking-tight"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {dialogState.title}
                </h3>
                <div className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed break-words whitespace-pre-line font-medium">
                  {dialogState.message}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-7 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              {dialogState.mode === "confirm" && (
                <button
                  type="button"
                  onClick={() => dialogState.resolve(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  {dialogState.cancelText}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={() => {
                  if (dialogState.mode === "confirm") {
                    dialogState.resolve(true);
                  } else {
                    dialogState.resolve();
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  dialogState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-500/20"
                    : dialogState.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-500/20"
                    : dialogState.variant === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-500/20"
                    : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-500/20"
                }`}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AlertContext.Provider>
  );
}
