export interface CertificateElement {
  id: string;
  name: string;
  type: "placeholder" | "custom_text";
  placeholderKey?:
    | "student_name"
    | "course_title"
    | "certificate_title"
    | "certificate_subtitle"
    | "issue_date"
    | "certificate_code"
    | "issuer_name"
    | "signatory_name1"
    | "signatory_role1"
    | "signatory_name2"
    | "signatory_role2";
  customText?: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  fontSize: number; // in pt/px
  fontWeight: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  fontFamily: "serif" | "sans" | "jakarta" | "mono";
  fontStyle?: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing?: "normal" | "wide" | "widest";
  uppercase?: boolean;
  maxWidth?: number; // percentage e.g. 80
}

export interface CertificateBackDesignConfig {
  presetId?: string;
  backgroundType: "image" | "color" | "gradient";
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundUrl?: string | null;
  borderStyle: "none" | "solid" | "double" | "dashed" | "gold-frame";
  borderColor?: string;
  borderWidth?: number;
  tableTheme: "dark" | "amber" | "blue" | "emerald" | "minimal";
  headerTitle: string;
  headerSubtitle: string;
  showWorkloadColumn: boolean;
  showCategoryColumn: boolean;
  showGradeColumn: boolean;
  showStatusBadge: boolean;
  showScoreSummary: boolean;
  showPredicate: boolean;
  showScaleLegend: boolean;
  showQrCode: boolean;
}

export interface CertificateDesignConfig {
  presetId?: string;
  aspectRatio?: "a4" | "16:10" | "16:9";
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundType: "image" | "color" | "gradient";
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundUrl?: string | null;
  borderStyle: "none" | "solid" | "double" | "dashed" | "gold-frame";
  borderColor?: string;
  borderWidth?: number;
  showSealBadge?: boolean;
  sealPosition?: { x: number; y: number };
  elements: CertificateElement[];
  backConfig?: CertificateBackDesignConfig;
}

export const DEFAULT_BACK_DESIGN_PRESET: CertificateBackDesignConfig = {
  presetId: "academic-slate",
  backgroundType: "color",
  backgroundColor: "#ffffff",
  backgroundUrl: null,
  borderStyle: "solid",
  borderColor: "#e2e8f0",
  tableTheme: "dark",
  headerTitle: "Transkrip Nilai & Capaian Kompetensi",
  headerSubtitle: "Official Academic Transcript & Competency Assessment",
  showWorkloadColumn: true,
  showCategoryColumn: true,
  showGradeColumn: true,
  showStatusBadge: true,
  showScoreSummary: true,
  showPredicate: true,
  showScaleLegend: true,
  showQrCode: true,
};

export const BACK_DESIGN_PRESETS: {
  id: string;
  name: string;
  description: string;
  config: CertificateBackDesignConfig;
}[] = [
  {
    id: "academic-slate",
    name: "Akademik Formal (Slate)",
    description: "Desain transkrip standar universitas dengan header tabel gelap dan garis bersih.",
    config: {
      ...DEFAULT_BACK_DESIGN_PRESET,
      presetId: "academic-slate",
      tableTheme: "dark",
      borderStyle: "solid",
    },
  },
  {
    id: "classic-gold",
    name: "Classic Gold Luxury",
    description: "Bingkai emas elegan bernuansa hangat dengan aksen kuning gading.",
    config: {
      ...DEFAULT_BACK_DESIGN_PRESET,
      presetId: "classic-gold",
      tableTheme: "amber",
      borderStyle: "gold-frame",
      backgroundColor: "#fffdfa",
    },
  },
  {
    id: "ocean-maritime",
    name: "Blue Ocean Tech",
    description: "Gaya maritim & teknologi dengan aksen biru laut yang tajam dan segar.",
    config: {
      ...DEFAULT_BACK_DESIGN_PRESET,
      presetId: "ocean-maritime",
      tableTheme: "blue",
      borderStyle: "double",
      backgroundColor: "#f8fafc",
    },
  },
  {
    id: "emerald-nature",
    name: "Emerald Eco (Hijau)",
    description: "Nuansa ekologi maritim hijau segar untuk program keberlanjutan.",
    config: {
      ...DEFAULT_BACK_DESIGN_PRESET,
      presetId: "emerald-nature",
      tableTheme: "emerald",
      borderStyle: "solid",
      backgroundColor: "#fcfdfc",
    },
  },
  {
    id: "clean-minimal",
    name: "Minimalis Modern",
    description: "Sangat bersih dan minimalis tanpa banyak ornamen, mengutamakan keterbacaan data.",
    config: {
      ...DEFAULT_BACK_DESIGN_PRESET,
      presetId: "clean-minimal",
      tableTheme: "minimal",
      borderStyle: "solid",
      backgroundColor: "#ffffff",
    },
  },
];

export interface CertificateDataValues {
  // snake_case placeholders
  student_name?: string;
  course_title?: string;
  category_name?: string;
  certificate_title?: string;
  certificate_subtitle?: string;
  subtitle?: string;
  issue_date?: string;
  certificate_code?: string;
  issuer_name?: string;
  signatory_name1?: string;
  signatory_name_1?: string;
  signatory_role1?: string;
  signatory_role_1?: string;
  signatory_name2?: string;
  signatory_name_2?: string;
  signatory_role2?: string;
  signatory_role_2?: string;

  // camelCase aliases
  studentName?: string;
  courseTitle?: string;
  certificateTitle?: string;
  issueDate?: string;
  certificateCode?: string;
  issuerName?: string;
  signatoryName1?: string;
  signatoryRole1?: string;
  signatoryName2?: string;
  signatoryRole2?: string;
}

export const PLACEHOLDER_OPTIONS = [
  { key: "student_name", label: "Nama Siswa", tag: "{{student_name}}", defaultText: "Budi Pratama" },
  { key: "course_title", label: "Nama Kursus / Kelas", tag: "{{course_title}}", defaultText: "Fullstack Web & AI Masterclass" },
  { key: "certificate_title", label: "Judul Sertifikat", tag: "{{certificate_title}}", defaultText: "Certificate of Completion" },
  { key: "certificate_subtitle", label: "Narasi / Keterangan", tag: "{{certificate_subtitle}}", defaultText: "Atas kelulusan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria akademik." },
  { key: "issue_date", label: "Tanggal Terbit", tag: "{{issue_date}}", defaultText: "30 September 2026" },
  { key: "certificate_code", label: "Kode Kredensial / ID", tag: "{{certificate_code}}", defaultText: "MT-CERT-2026-9041" },
  { key: "issuer_name", label: "Nama Lembaga / Institusi", tag: "{{issuer_name}}", defaultText: "PT. Matoh Technologies Indonesia" },
  { key: "signatory_name1", label: "Nama Tanda Tangan 1", tag: "{{signatory_name1}}", defaultText: "Dr. G. Prabantoro, SE., MM., CBec." },
  { key: "signatory_role1", label: "Jabatan Tanda Tangan 1", tag: "{{signatory_role1}}", defaultText: "Lead Instructor & RnD Director" },
  { key: "signatory_name2", label: "Nama Tanda Tangan 2", tag: "{{signatory_name2}}", defaultText: "Dr. E. Lovita, SE., Ak., M.Si., CA." },
  { key: "signatory_role2", label: "Jabatan Tanda Tangan 2", tag: "{{signatory_role2}}", defaultText: "Head of Academic Board" },
] as const;

export const DEFAULT_DESIGN_PRESETS: { id: string; name: string; description: string; config: CertificateDesignConfig }[] = [
  {
    id: "classic-gold",
    name: "Classic Gold Parchment",
    description: "Desain piagam klasik mewah dengan ornamen emas dan font serif prestisius.",
    config: {
      presetId: "classic-gold",
      backgroundType: "color",
      backgroundColor: "#fffdf9",
      borderStyle: "gold-frame",
      borderColor: "#d97706",
      borderWidth: 6,
      showSealBadge: false,
      sealPosition: { x: 50, y: 78 },
      elements: [
        {
          id: "el-issuer",
          name: "Nama Lembaga",
          type: "placeholder",
          placeholderKey: "issuer_name",
          x: 50,
          y: 13,
          fontSize: 16,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#92400e",
          textAlign: "center",
          uppercase: true,
          letterSpacing: "widest",
        },
        {
          id: "el-title",
          name: "Judul Sertifikat",
          type: "placeholder",
          placeholderKey: "certificate_title",
          x: 50,
          y: 22,
          fontSize: 26,
          fontWeight: "extrabold",
          fontFamily: "serif",
          color: "#78350f",
          textAlign: "center",
          letterSpacing: "wide",
        },
        {
          id: "el-awarded-to",
          name: "Label 'Diberikan Kepada'",
          type: "custom_text",
          customText: "DIBERIKAN DENGAN BANGGA KEPADA:",
          x: 50,
          y: 32,
          fontSize: 10,
          fontWeight: "semibold",
          fontFamily: "sans",
          color: "#a8a29e",
          textAlign: "center",
          uppercase: true,
          letterSpacing: "widest",
        },
        {
          id: "el-student",
          name: "Nama Siswa",
          type: "placeholder",
          placeholderKey: "student_name",
          x: 50,
          y: 42,
          fontSize: 34,
          fontWeight: "extrabold",
          fontFamily: "serif",
          color: "#1c1917",
          textAlign: "center",
        },
        {
          id: "el-subtitle",
          name: "Narasi / Keterangan",
          type: "placeholder",
          placeholderKey: "certificate_subtitle",
          x: 50,
          y: 53,
          fontSize: 11,
          fontWeight: "normal",
          fontFamily: "sans",
          color: "#57534e",
          textAlign: "center",
          maxWidth: 75,
        },
        {
          id: "el-course",
          name: "Nama Kursus",
          type: "placeholder",
          placeholderKey: "course_title",
          x: 50,
          y: 63,
          fontSize: 19,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#9a3412",
          textAlign: "center",
        },
        {
          id: "el-sig1-name",
          name: "Ttd 1 - Nama",
          type: "placeholder",
          placeholderKey: "signatory_name1",
          x: 22,
          y: 77,
          fontSize: 13,
          fontWeight: "bold",
          fontFamily: "serif",
          fontStyle: "italic",
          color: "#292524",
          textAlign: "center",
        },
        {
          id: "el-sig1-role",
          name: "Ttd 1 - Jabatan",
          type: "placeholder",
          placeholderKey: "signatory_role1",
          x: 22,
          y: 83,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#78716c",
          textAlign: "center",
        },
        {
          id: "el-sig2-name",
          name: "Ttd 2 - Nama",
          type: "placeholder",
          placeholderKey: "signatory_name2",
          x: 78,
          y: 77,
          fontSize: 13,
          fontWeight: "bold",
          fontFamily: "serif",
          fontStyle: "italic",
          color: "#292524",
          textAlign: "center",
        },
        {
          id: "el-sig2-role",
          name: "Ttd 2 - Jabatan",
          type: "placeholder",
          placeholderKey: "signatory_role2",
          x: 78,
          y: 83,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#78716c",
          textAlign: "center",
        },
        {
          id: "el-cred-code",
          name: "Kode Kredensial",
          type: "custom_text",
          customText: "ID: {{certificate_code}} • {{issue_date}}",
          x: 50,
          y: 93,
          fontSize: 9,
          fontWeight: "medium",
          fontFamily: "mono",
          color: "#a8a29e",
          textAlign: "center",
        },
      ],
    },
  },
  {
    id: "modern-tech",
    name: "Modern Tech Minimalist",
    description: "Gaya modern bersih dengan tipografi sans-serif kontemporer dan aksen oranye.",
    config: {
      presetId: "modern-tech",
      backgroundType: "color",
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderColor: "#e2e8f0",
      borderWidth: 3,
      showSealBadge: false,
      sealPosition: { x: 50, y: 77 },
      elements: [
        {
          id: "mt-issuer",
          name: "Nama Lembaga",
          type: "placeholder",
          placeholderKey: "issuer_name",
          x: 10,
          y: 12,
          fontSize: 15,
          fontWeight: "extrabold",
          fontFamily: "jakarta",
          color: "#ea580c",
          textAlign: "left",
          letterSpacing: "wide",
        },
        {
          id: "mt-title",
          name: "Judul Sertifikat",
          type: "placeholder",
          placeholderKey: "certificate_title",
          x: 10,
          y: 22,
          fontSize: 24,
          fontWeight: "extrabold",
          fontFamily: "jakarta",
          color: "#0f172a",
          textAlign: "left",
          uppercase: true,
        },
        {
          id: "mt-for",
          name: "Label For",
          type: "custom_text",
          customText: "THIS IS PROUDLY PRESENTED TO:",
          x: 10,
          y: 33,
          fontSize: 9,
          fontWeight: "bold",
          fontFamily: "sans",
          color: "#94a3b8",
          textAlign: "left",
          letterSpacing: "widest",
        },
        {
          id: "mt-student",
          name: "Nama Siswa",
          type: "placeholder",
          placeholderKey: "student_name",
          x: 10,
          y: 43,
          fontSize: 32,
          fontWeight: "extrabold",
          fontFamily: "jakarta",
          color: "#0f172a",
          textAlign: "left",
        },
        {
          id: "mt-subtitle",
          name: "Narasi",
          type: "placeholder",
          placeholderKey: "certificate_subtitle",
          x: 10,
          y: 53,
          fontSize: 11,
          fontWeight: "normal",
          fontFamily: "sans",
          color: "#64748b",
          textAlign: "left",
          maxWidth: 80,
        },
        {
          id: "mt-course",
          name: "Nama Kursus",
          type: "placeholder",
          placeholderKey: "course_title",
          x: 10,
          y: 63,
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#c2410c",
          textAlign: "left",
        },
        {
          id: "mt-sig1",
          name: "Instruktur",
          type: "placeholder",
          placeholderKey: "signatory_name1",
          x: 15,
          y: 80,
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "sans",
          color: "#0f172a",
          textAlign: "left",
        },
        {
          id: "mt-sig1-r",
          name: "Jabatan Instruktur",
          type: "placeholder",
          placeholderKey: "signatory_role1",
          x: 15,
          y: 85,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#94a3b8",
          textAlign: "left",
        },
        {
          id: "mt-sig2",
          name: "Pimpinan",
          type: "placeholder",
          placeholderKey: "signatory_name2",
          x: 75,
          y: 80,
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "sans",
          color: "#0f172a",
          textAlign: "left",
        },
        {
          id: "mt-sig2-r",
          name: "Jabatan Pimpinan",
          type: "placeholder",
          placeholderKey: "signatory_role2",
          x: 75,
          y: 85,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#94a3b8",
          textAlign: "left",
        },
        {
          id: "mt-code",
          name: "ID & Tanggal",
          type: "custom_text",
          customText: "CREDENTIAL ID: {{certificate_code}} • ISSUED: {{issue_date}}",
          x: 50,
          y: 93,
          fontSize: 9,
          fontWeight: "medium",
          fontFamily: "mono",
          color: "#94a3b8",
          textAlign: "center",
        },
      ],
    },
  },
  {
    id: "corporate-navy",
    name: "Corporate Executive Navy",
    description: "Warna biru navy elegan profesional dengan aksen platinum dan garis border simetris.",
    config: {
      presetId: "corporate-navy",
      backgroundType: "color",
      backgroundColor: "#f8fafc",
      borderStyle: "double",
      borderColor: "#1e3a8a",
      borderWidth: 6,
      showSealBadge: false,
      sealPosition: { x: 50, y: 78 },
      elements: [
        {
          id: "cn-issuer",
          name: "Institusi",
          type: "placeholder",
          placeholderKey: "issuer_name",
          x: 50,
          y: 13,
          fontSize: 17,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#1e3a8a",
          textAlign: "center",
          uppercase: true,
          letterSpacing: "widest",
        },
        {
          id: "cn-title",
          name: "Judul",
          type: "placeholder",
          placeholderKey: "certificate_title",
          x: 50,
          y: 22,
          fontSize: 27,
          fontWeight: "bold",
          fontFamily: "serif",
          color: "#0f172a",
          textAlign: "center",
        },
        {
          id: "cn-for",
          name: "Label",
          type: "custom_text",
          customText: "DIBERIKAN KEPADA",
          x: 50,
          y: 33,
          fontSize: 10,
          fontWeight: "semibold",
          fontFamily: "sans",
          color: "#64748b",
          textAlign: "center",
          letterSpacing: "wide",
        },
        {
          id: "cn-student",
          name: "Nama Siswa",
          type: "placeholder",
          placeholderKey: "student_name",
          x: 50,
          y: 43,
          fontSize: 34,
          fontWeight: "extrabold",
          fontFamily: "serif",
          color: "#1e3a8a",
          textAlign: "center",
        },
        {
          id: "cn-subtitle",
          name: "Keterangan",
          type: "placeholder",
          placeholderKey: "certificate_subtitle",
          x: 50,
          y: 53,
          fontSize: 11,
          fontWeight: "normal",
          fontFamily: "sans",
          color: "#475569",
          textAlign: "center",
          maxWidth: 75,
        },
        {
          id: "cn-course",
          name: "Kelas",
          type: "placeholder",
          placeholderKey: "course_title",
          x: 50,
          y: 63,
          fontSize: 19,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#0f172a",
          textAlign: "center",
        },
        {
          id: "cn-sig1",
          name: "Ttd 1",
          type: "placeholder",
          placeholderKey: "signatory_name1",
          x: 22,
          y: 78,
          fontSize: 13,
          fontWeight: "bold",
          fontFamily: "serif",
          fontStyle: "italic",
          color: "#1e293b",
          textAlign: "center",
        },
        {
          id: "cn-sig1-r",
          name: "Jabatan 1",
          type: "placeholder",
          placeholderKey: "signatory_role1",
          x: 22,
          y: 84,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#64748b",
          textAlign: "center",
        },
        {
          id: "cn-sig2",
          name: "Ttd 2",
          type: "placeholder",
          placeholderKey: "signatory_name2",
          x: 78,
          y: 78,
          fontSize: 13,
          fontWeight: "bold",
          fontFamily: "serif",
          fontStyle: "italic",
          color: "#1e293b",
          textAlign: "center",
        },
        {
          id: "cn-sig2-r",
          name: "Jabatan 2",
          type: "placeholder",
          placeholderKey: "signatory_role2",
          x: 78,
          y: 84,
          fontSize: 10,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#64748b",
          textAlign: "center",
        },
        {
          id: "cn-code",
          name: "Kredensial",
          type: "custom_text",
          customText: "No: {{certificate_code}} • Terbit: {{issue_date}}",
          x: 50,
          y: 93,
          fontSize: 9,
          fontWeight: "medium",
          fontFamily: "mono",
          color: "#64748b",
          textAlign: "center",
        },
      ],
    },
  },
  {
    id: "custom-template",
    name: "Template Gambar Kustom",
    description: "Gunakan gambar template latar belakang yang diunggah dan atur placeholder di atasnya.",
    config: {
      presetId: "custom-template",
      backgroundType: "image",
      backgroundColor: "#ffffff",
      borderStyle: "none",
      borderWidth: 0,
      showSealBadge: false,
      elements: [
        {
          id: "cust-student",
          name: "Nama Siswa",
          type: "placeholder",
          placeholderKey: "student_name",
          x: 50,
          y: 45,
          fontSize: 36,
          fontWeight: "extrabold",
          fontFamily: "serif",
          color: "#1c1917",
          textAlign: "center",
        },
        {
          id: "cust-course",
          name: "Nama Kursus",
          type: "placeholder",
          placeholderKey: "course_title",
          x: 50,
          y: 60,
          fontSize: 20,
          fontWeight: "bold",
          fontFamily: "jakarta",
          color: "#9a3412",
          textAlign: "center",
        },
        {
          id: "cust-date",
          name: "Tanggal Terbit",
          type: "placeholder",
          placeholderKey: "issue_date",
          x: 30,
          y: 80,
          fontSize: 12,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#44403c",
          textAlign: "center",
        },
        {
          id: "cust-code",
          name: "ID Kredensial",
          type: "placeholder",
          placeholderKey: "certificate_code",
          x: 70,
          y: 80,
          fontSize: 12,
          fontWeight: "medium",
          fontFamily: "mono",
          color: "#44403c",
          textAlign: "center",
        },
      ],
    },
  },
];

export function resolveElementText(
  el: CertificateElement,
  data: CertificateDataValues,
  useSampleFallback = true
): string {
  if (el.type === "custom_text") {
    let text = el.customText || "";
    for (const opt of PLACEHOLDER_OPTIONS) {
      const val = data[opt.key as keyof CertificateDataValues] || (useSampleFallback ? opt.defaultText : "");
      text = text.replaceAll(opt.tag, val || "");
    }
    return text;
  }

  if (el.type === "placeholder" && el.placeholderKey) {
    const val = data[el.placeholderKey as keyof CertificateDataValues];
    if (val) return val;
    if (useSampleFallback) {
      const opt = PLACEHOLDER_OPTIONS.find((p) => p.key === el.placeholderKey);
      return opt ? opt.defaultText : `{{${el.placeholderKey}}}`;
    }
    return "";
  }

  return "";
}
