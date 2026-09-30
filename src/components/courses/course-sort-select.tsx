"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface CourseSortSelectProps {
  defaultValue?: string;
  options: { value: string; label: string }[];
}

export function CourseSortSelect({ defaultValue = "popular", options }: CourseSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className="h-9 px-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
      defaultValue={defaultValue}
      onChange={handleChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
