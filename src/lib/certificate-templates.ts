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
  fontFamily: "serif" | "sans" | "jakarta" | "mono" | "arial";
  fontStyle?: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing?: "normal" | "wide" | "widest";
  uppercase?: boolean;
  maxWidth?: number; // percentage e.g. 80
  width?: number; // percentage width e.g. 15 - 100
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
  presetId: "clean-minimal",
  backgroundType: "color",
  backgroundColor: "#ffffff",
  backgroundUrl: null,
  borderStyle: "none",
  borderColor: "#ffffff",
  tableTheme: "minimal",
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
  { key: "course_title", label: "Nama Kursus / Kursus", tag: "{{course_title}}", defaultText: "Fullstack Web & AI Masterclass" },
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
    id: "matoh-official",
    name: "Matoh Technologies Official (Default)",
    description: "Template sertifikat resmi berlisensi PT. Matoh Technologies Indonesia dengan kop logo Jakarta, watermark institusi, frame artistik, dan verifikasi kredensial.",
    config: {
      presetId: "matoh-official",
      aspectRatio: "a4",
      backgroundType: "image",
      backgroundColor: "#ffffff",
      backgroundUrl: "/images/certificates/matoh-official-certificate.jpg",
      borderStyle: "none",
      borderWidth: 0,
      showSealBadge: false,
      sealPosition: { x: 50, y: 78 },
      elements: [
        {
          id: "mo-student-name",
          name: "Nama Siswa",
          type: "placeholder",
          placeholderKey: "student_name",
          x: 50,
          y: 36.5,
          fontSize: 34,
          fontWeight: "bold",
          fontFamily: "arial",
          color: "#0f172a",
          textAlign: "center",
          maxWidth: 82,
        },
        {
          id: "mo-course-title",
          name: "Nama Kursus",
          type: "placeholder",
          placeholderKey: "course_title",
          x: 50,
          y: 63,
          fontSize: 30,
          fontWeight: "bold",
          fontFamily: "arial",
          color: "#1e293b",
          textAlign: "center",
          width: 76,
          maxWidth: 76,
        },
        {
          id: "mo-issue-date",
          name: "Tanggal Terbit",
          type: "placeholder",
          placeholderKey: "issue_date",
          x: 15.5,
          y: 88.8,
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "arial",
          color: "#0e7485",
          textAlign: "left",
        },
        {
          id: "mo-cert-code",
          name: "Nomor Sertifikat",
          type: "placeholder",
          placeholderKey: "certificate_code",
          x: 74,
          y: 87.7,
          fontSize: 16,
          fontWeight: "bold",
          fontFamily: "arial",
          color: "#0e7485",
          textAlign: "left",
        },
        {
          id: "mo-signatory-name",
          name: "Nama Penandatangan",
          type: "placeholder",
          placeholderKey: "signatory_name1",
          x: 56,
          y: 92.5,
          fontSize: 10,
          fontWeight: "bold",
          fontFamily: "arial",
          color: "#1f2937",
          textAlign: "center",
        },
        {
          id: "mo-signatory-role",
          name: "Jabatan Penandatangan",
          type: "placeholder",
          placeholderKey: "signatory_role1",
          x: 56,
          y: 95.5,
          fontSize: 10,
          fontWeight: "normal",
          fontFamily: "arial",
          color: "#4b5563",
          textAlign: "center",
        },
      ],
      backConfig: {
        ...DEFAULT_BACK_DESIGN_PRESET,
        presetId: "academic-slate",
        tableTheme: "minimal",
        borderStyle: "solid",
        backgroundColor: "#ffffff",
        headerTitle: "Transkrip Nilai & Capaian Kompetensi",
        headerSubtitle: "Official Academic Transcript & Competency Assessment — PT. Matoh Technologies Indonesia",
      },
    },
  },
];

export function resolveElementText(
  el: CertificateElement,
  data: CertificateDataValues,
  useSampleFallback = true
): string {
  // Mode "Placeholder" (Tags view): display raw template tags {{key}} instead of data
  if (!useSampleFallback) {
    if (el.type === "placeholder" && el.placeholderKey) {
      return `{{${el.placeholderKey}}}`;
    }
    if (el.type === "custom_text") {
      return el.customText || "";
    }
    return el.name || "";
  }

  const getAliasValue = (key: string): string | undefined => {
    const rawVal = data[key as keyof CertificateDataValues];
    if (rawVal) return rawVal;

    // Check common aliases
    if (key === "signatory_name1") {
      return (
        data.signatory_name1 ||
        data.signatory_name_1 ||
        data.signatoryName1 ||
        (data as Record<string, string | undefined>).instructorName ||
        (data as Record<string, string | undefined>).leadInstructor
      );
    }
    if (key === "signatory_role1") {
      return data.signatory_role1 || data.signatory_role_1 || data.signatoryRole1;
    }
    if (key === "signatory_name2") {
      return data.signatory_name2 || data.signatory_name_2 || data.signatoryName2;
    }
    if (key === "signatory_role2") {
      return data.signatory_role2 || data.signatory_role_2 || data.signatoryRole2;
    }
    if (key === "student_name") {
      return data.student_name || data.studentName;
    }
    if (key === "course_title") {
      return data.course_title || data.courseTitle;
    }
    if (key === "category_name") {
      return data.category_name || (data as Record<string, string | undefined>).categoryName;
    }
    if (key === "certificate_title") {
      return data.certificate_title || data.certificateTitle;
    }
    if (key === "certificate_subtitle") {
      return data.certificate_subtitle || data.subtitle;
    }
    if (key === "issue_date") {
      return data.issue_date || data.issueDate || (data as Record<string, string | undefined>).issueDisplay;
    }
    if (key === "certificate_code") {
      return data.certificate_code || data.certificateCode;
    }
    if (key === "issuer_name") {
      return data.issuer_name || data.issuerName;
    }
    return undefined;
  };

  if (el.type === "custom_text") {
    let text = el.customText || "";
    for (const opt of PLACEHOLDER_OPTIONS) {
      const val = getAliasValue(opt.key) || (useSampleFallback ? opt.defaultText : "");
      text = text.replaceAll(opt.tag, val || "");
    }
    return text;
  }

  if (el.type === "placeholder" && el.placeholderKey) {
    const val = getAliasValue(el.placeholderKey);
    if (val) return val;
    if (useSampleFallback) {
      const opt = PLACEHOLDER_OPTIONS.find((p) => p.key === el.placeholderKey);
      return opt ? opt.defaultText : `{{${el.placeholderKey}}}`;
    }
    return "";
  }

  return "";
}

export const MATOH_OFFICIAL_PRESET = DEFAULT_DESIGN_PRESETS[0];
export const DEFAULT_CERTIFICATE_CONFIG = MATOH_OFFICIAL_PRESET.config;
