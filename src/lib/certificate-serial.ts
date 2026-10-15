/**
 * Utility functions for generating and formatting custom certificate serial numbers
 * tailored per course.
 */

export const DEFAULT_SERIAL_PATTERN = "MT/{COURSE_CODE}/{YEAR}/{COUNTER}";

export const SERIAL_TAG_DESCRIPTIONS = [
  { tag: "{COURSE_CODE}", desc: "Kode singkatan unik kelas", example: "FSW" },
  { tag: "{YEAR}", desc: "Tahun penerbitan (4 digit)", example: "2026" },
  { tag: "{YY}", desc: "Tahun penerbitan (2 digit)", example: "26" },
  { tag: "{MONTH}", desc: "Bulan penerbitan (2 digit)", example: "10" },
  { tag: "{MONTH_ROMAN}", desc: "Bulan angka Romawi", example: "X" },
  { tag: "{DAY}", desc: "Tanggal penerbitan (2 digit)", example: "15" },
  { tag: "{COUNTER}", desc: "Nomor urut kelulusan dengan padding", example: "0001" },
  { tag: "{RAW_COUNTER}", desc: "Nomor urut kelulusan tanpa padding", example: "1" },
  { tag: "{RANDOM}", desc: "Kode alfanumerik acak 4 karakter", example: "9K2A" },
];

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export interface FormatSerialOptions {
  pattern?: string | null;
  courseCode?: string | null;
  counter?: number;
  counterPadding?: number;
  issueDate?: Date;
  randomLength?: number;
}

/**
 * Replace placeholders in pattern with contextual values
 */
export function formatCertificateSerialNumber(options: FormatSerialOptions): string {
  const pattern = options.pattern?.trim() || DEFAULT_SERIAL_PATTERN;
  const courseCode = (options.courseCode?.trim() || "COURSE").toUpperCase();
  const counter = Math.max(1, options.counter ?? 1);
  const padding = Math.max(1, Math.min(10, options.counterPadding ?? 4));
  const date = options.issueDate || new Date();

  const year4 = date.getFullYear().toString();
  const year2 = year4.slice(-2);
  const monthNum = (date.getMonth() + 1).toString().padStart(2, "0");
  const monthRoman = ROMAN_MONTHS[date.getMonth()] || "I";
  const day = date.getDate().toString().padStart(2, "0");
  const paddedCounter = counter.toString().padStart(padding, "0");
  const rawCounter = counter.toString();

  // Random segment
  const randomChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude confusing chars like 0,1,O,I
  let random4 = "";
  for (let i = 0; i < 4; i++) {
    random4 += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  let formatted = pattern
    .replace(/\{COURSE_CODE\}/gi, courseCode)
    .replace(/\{COURSE\}/gi, courseCode)
    .replace(/\{YEAR\}/gi, year4)
    .replace(/\{YYYY\}/gi, year4)
    .replace(/\{YY\}/gi, year2)
    .replace(/\{MONTH_ROMAN\}/gi, monthRoman)
    .replace(/\{MONTH\}/gi, monthNum)
    .replace(/\{MM\}/gi, monthNum)
    .replace(/\{DAY\}/gi, day)
    .replace(/\{DD\}/gi, day)
    .replace(/\{COUNTER\}/gi, paddedCounter)
    .replace(/\{RAW_COUNTER\}/gi, rawCounter)
    .replace(/\{RANDOM\}/gi, random4);

  return formatted;
}

/**
 * Generate preview serial for admin preview display
 */
export function generatePreviewSerialNumber(
  pattern: string,
  courseCode: string,
  counterPadding: number = 4,
  sampleCounter: number = 1
): string {
  return formatCertificateSerialNumber({
    pattern,
    courseCode,
    counter: sampleCounter,
    counterPadding,
    issueDate: new Date(),
  });
}
