"use client";

import {
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseLearningOutcomesEditorProps {
  value: string[];
  onChange: (items: string[]) => void;
}

export function CourseLearningOutcomesEditor({
  value,
  onChange,
}: CourseLearningOutcomesEditorProps) {
  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleItemChange = (index: number, text: string) => {
    const updated = [...value];
    updated[index] = text;
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-stone-900 text-base">
              Yang Akan Kamu Pelajari (Learning Outcomes)
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {value.length} Poin
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Poin-poin kompetensi dan hasil belajar yang akan ditampilkan di card biru detail kelas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {value.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Belum ada poin &ldquo;Yang Akan Kamu Pelajari&rdquo;
              </p>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                Tambahkan poin capaian pembelajaran agar calon peserta kelas memahami keahlian yang akan mereka peroleh.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus size={14} />}
                className="text-xs font-semibold"
              >
                Tambah Poin Pertama
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {value.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-white hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <CheckCircle2 size={16} />
                </div>

                <input
                  id={"learning-outcome-" + index}
                  name={"outcome_" + index}
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  placeholder={`Poin ${index + 1}: Contoh: Memahami konsep dasar dan implementasi nyata...`}
                  className="flex-1 bg-transparent px-2 py-1.5 text-sm text-stone-800 focus:outline-none placeholder:text-stone-400"
                />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus poin ini"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                leftIcon={<Plus size={14} />}
                className="rounded-xl text-xs font-semibold"
              >
                Tambah Poin Berikutnya
              </Button>

              <p className="text-[11px] text-stone-400">
                Tip: Disarankan mengisi 4 hingga 8 poin capaian pembelajaran
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
