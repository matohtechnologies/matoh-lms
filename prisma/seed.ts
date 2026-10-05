import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Matoh Technologies database...");

  // 1. Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "digital-marketing" },
      update: { name: "Digital Marketing", nameEn: "Digital Marketing", icon: "📣" },
      create: { name: "Digital Marketing", nameEn: "Digital Marketing", slug: "digital-marketing", icon: "📣" },
    }),
    prisma.category.upsert({
      where: { slug: "social-media-marketing" },
      update: { name: "Social Media Marketing", nameEn: "Social Media Marketing", icon: "📱" },
      create: { name: "Social Media Marketing", nameEn: "Social Media Marketing", slug: "social-media-marketing", icon: "📱" },
    }),
    prisma.category.upsert({
      where: { slug: "mcdm-ahp-ism" },
      update: { name: "MCDM (AHP & ISM)", nameEn: "MCDM (AHP & ISM)", icon: "📊" },
      create: { name: "MCDM (AHP & ISM)", nameEn: "MCDM (AHP & ISM)", slug: "mcdm-ahp-ism", icon: "📊" },
    }),
    prisma.category.upsert({
      where: { slug: "business-forecasting" },
      update: { name: "Peramalan Bisnis & SWOT", nameEn: "Business Forecasting & SWOT", icon: "📈" },
      create: { name: "Peramalan Bisnis & SWOT", nameEn: "Business Forecasting & SWOT", slug: "business-forecasting", icon: "📈" },
    }),
    prisma.category.upsert({
      where: { slug: "innovation-management" },
      update: { name: "Inovasi & Design Thinking", nameEn: "Innovation & Design Thinking", icon: "💡" },
      create: { name: "Inovasi & Design Thinking", nameEn: "Innovation & Design Thinking", slug: "innovation-management", icon: "💡" },
    }),
    prisma.category.upsert({
      where: { slug: "riset-publikasi" },
      update: { name: "Riset & Publikasi", nameEn: "Research & Publication", icon: "🔬" },
      create: { name: "Riset & Publikasi", nameEn: "Research & Publication", slug: "riset-publikasi", icon: "🔬" },
    }),
  ]);

  console.log(`✅ ${categories.length} categories verified`);

  // 2. Instructors & Admin
  const defaultPassword = await bcrypt.hash("Admin@123456", 12);
  const instructorPassword = await bcrypt.hash("Matoh@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@matohtechnologies.com" },
    update: { name: "Admin Matoh Technologies", role: "ADMIN" },
    create: {
      name: "Admin Matoh Technologies",
      email: "admin@matohtechnologies.com",
      password: defaultPassword,
      role: "ADMIN",
    },
  });

  // Preserve legacy admin if exists
  await prisma.user.upsert({
    where: { email: "admin@earthyacademy.com" },
    update: { name: "Admin Matoh Technologies", role: "ADMIN" },
    create: {
      name: "Admin Matoh Technologies",
      email: "admin@earthyacademy.com",
      password: defaultPassword,
      role: "ADMIN",
    },
  });

  const drGatot = await prisma.user.upsert({
    where: { email: "gatot@matohtechnologies.com" },
    update: {
      name: "Dr. G. Prabantoro, SE., MM., CBec.",
      role: "INSTRUCTOR",
      bio: "RnD Director PT. Matoh Technologies Indonesia. Peneliti, akademisi, dan konsultan strategi transformasi digital UMKM.",
    },
    create: {
      name: "Dr. G. Prabantoro, SE., MM., CBec.",
      email: "gatot@matohtechnologies.com",
      password: instructorPassword,
      role: "INSTRUCTOR",
      bio: "RnD Director PT. Matoh Technologies Indonesia. Peneliti, akademisi, dan konsultan strategi transformasi digital UMKM.",
    },
  });

  const drAminoto = await prisma.user.upsert({
    where: { email: "aminoto@matohtechnologies.com" },
    update: {
      name: "Dr. T. Aminoto, S.Fis, M.Si.",
      role: "INSTRUCTOR",
      bio: "Pakar Biostatistika, Pengambilan Keputusan Multikriteria (MCDM), dan Analisis Sistem Komputasi.",
    },
    create: {
      name: "Dr. T. Aminoto, S.Fis, M.Si.",
      email: "aminoto@matohtechnologies.com",
      password: instructorPassword,
      role: "INSTRUCTOR",
      bio: "Pakar Biostatistika, Pengambilan Keputusan Multikriteria (MCDM), dan Analisis Sistem Komputasi.",
    },
  });

  const drLovita = await prisma.user.upsert({
    where: { email: "lovita@matohtechnologies.com" },
    update: {
      name: "Dr. E. Lovita, SE., Ak., M.Si., CA., CSRS., CSRA., CBec.",
      role: "INSTRUCTOR",
      bio: "Dosen dan konsultan akuntansi, peramalan keuangan bisnis, dan tata kelola korporasi.",
    },
    create: {
      name: "Dr. E. Lovita, SE., Ak., M.Si., CA., CSRS., CSRA., CBec.",
      email: "lovita@matohtechnologies.com",
      password: instructorPassword,
      role: "INSTRUCTOR",
      bio: "Dosen dan konsultan akuntansi, peramalan keuangan bisnis, dan tata kelola korporasi.",
    },
  });

  const erikHermawan = await prisma.user.upsert({
    where: { email: "hermawan@matohtechnologies.com" },
    update: {
      name: "E. Hermawan, ST., M.Kom.",
      role: "INSTRUCTOR",
      bio: "Pakar Arsitektur Teknologi Digital, Cloud System, dan Innovation Management.",
    },
    create: {
      name: "E. Hermawan, ST., M.Kom.",
      email: "hermawan@matohtechnologies.com",
      password: instructorPassword,
      role: "INSTRUCTOR",
      bio: "Pakar Arsitektur Teknologi Digital, Cloud System, dan Innovation Management.",
    },
  });

  console.log(`✅ Instructors & Admin verified`);

  // 3. Matoh Technologies Courses
  // Course 1: Digital Marketing
  const course1 = await prisma.course.upsert({
    where: { slug: "digital-marketing-strategi-praktik" },
    update: {
      title: "Digital Marketing: Strategi dan Praktik Nyata untuk Era Digital",
      titleEn: "Digital Marketing: Practical Strategy for Digital Era",
      description: "Kursus intensif yang dirancang oleh Dr. G. Prabantoro bagi pelaku usaha (UMKM), profesional, dan akademisi yang ingin menguasai praktik pemasaran modern berbasis digital. Peserta dibekali pemahaman mendalam tentang strategi digital marketing, mulai dari segmentasi pasar, pemanfaatan media sosial, hingga optimalisasi mesin pencari (SEO) dan evaluasi kinerja kampanye.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      price: 300000,
      discountPrice: 249000,
      level: "BEGINNER",
      duration: 360,
      totalLessons: 10,
      published: true,
      featured: true,
      categoryId: categories[0].id,
      instructorId: drGatot.id,
    },
    create: {
      slug: "digital-marketing-strategi-praktik",
      title: "Digital Marketing: Strategi dan Praktik Nyata untuk Era Digital",
      titleEn: "Digital Marketing: Practical Strategy for Digital Era",
      description: "Kursus intensif yang dirancang oleh Dr. G. Prabantoro bagi pelaku usaha (UMKM), profesional, dan akademisi yang ingin menguasai praktik pemasaran modern berbasis digital. Peserta dibekali pemahaman mendalam tentang strategi digital marketing, mulai dari segmentasi pasar, pemanfaatan media sosial, hingga optimalisasi mesin pencari (SEO) dan evaluasi kinerja kampanye.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      price: 300000,
      discountPrice: 249000,
      level: "BEGINNER",
      duration: 360,
      totalLessons: 10,
      published: true,
      featured: true,
      categoryId: categories[0].id,
      instructorId: drGatot.id,
    },
  });

  const sec1 = await prisma.section.upsert({
    where: { id: "sec-dm-1" },
    update: { title: "Dasar-dasar Digital Marketing & Analisis Pasar", order: 1, courseId: course1.id },
    create: { id: "sec-dm-1", title: "Dasar-dasar Digital Marketing & Analisis Pasar", order: 1, courseId: course1.id },
  });

  await prisma.lesson.upsert({
    where: { sectionId_slug: { sectionId: sec1.id, slug: "pengantar-digital-marketing" } },
    update: { title: "Pengantar Pemasaran Digital & Transformasi Bisnis", duration: 15, isFree: true, order: 1 },
    create: {
      slug: "pengantar-digital-marketing",
      title: "Pengantar Pemasaran Digital & Transformasi Bisnis",
      duration: 15,
      isFree: true,
      order: 1,
      sectionId: sec1.id,
      videoUrl: "https://www.youtube.com/embed/843nec-IvW0",
    },
  });

  await prisma.lesson.upsert({
    where: { sectionId_slug: { sectionId: sec1.id, slug: "customer-journey-segmentasi" } },
    update: { title: "Digital Customer Journey & Segmentasi Pasar Online", duration: 25, isFree: false, order: 2 },
    create: {
      slug: "customer-journey-segmentasi",
      title: "Digital Customer Journey & Segmentasi Pasar Online",
      duration: 25,
      isFree: false,
      order: 2,
      sectionId: sec1.id,
    },
  });

  const sec2 = await prisma.section.upsert({
    where: { id: "sec-dm-2" },
    update: { title: "Strategi Konten & Kanal Digital Marketing", order: 2, courseId: course1.id },
    create: { id: "sec-dm-2", title: "Strategi Konten & Kanal Digital Marketing", order: 2, courseId: course1.id },
  });

  await prisma.lesson.upsert({
    where: { sectionId_slug: { sectionId: sec2.id, slug: "content-marketing-storytelling" } },
    update: { title: "Content Marketing, Storytelling & Copywriting", duration: 30, isFree: false, order: 1 },
    create: {
      slug: "content-marketing-storytelling",
      title: "Content Marketing, Storytelling & Copywriting",
      duration: 30,
      isFree: false,
      order: 1,
      sectionId: sec2.id,
    },
  });

  // Course 2: MCDM Using AHP
  await prisma.course.upsert({
    where: { slug: "mcdm-using-ahp" },
    update: {
      title: "MCDM Using AHP (Analytic Hierarchy Process) untuk Penelitian & Bisnis",
      titleEn: "MCDM Using AHP for Research and Strategic Decision",
      description: "Pelatihan metode Multi-Criteria Decision Making (MCDM) menggunakan Analytic Hierarchy Process (AHP). Membantu akademisi, peneliti, dan pimpinan bisnis menentukan prioritas alternatif keputusan dengan bobot kriteria terstruktur, konsistensi matematis, dan studi kasus riil.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 350000,
      discountPrice: 299000,
      level: "INTERMEDIATE",
      duration: 270,
      totalLessons: 8,
      published: true,
      featured: true,
      categoryId: categories[2].id,
      instructorId: drAminoto.id,
    },
    create: {
      slug: "mcdm-using-ahp",
      title: "MCDM Using AHP (Analytic Hierarchy Process) untuk Penelitian & Bisnis",
      titleEn: "MCDM Using AHP for Research and Strategic Decision",
      description: "Pelatihan metode Multi-Criteria Decision Making (MCDM) menggunakan Analytic Hierarchy Process (AHP). Membantu akademisi, peneliti, dan pimpinan bisnis menentukan prioritas alternatif keputusan dengan bobot kriteria terstruktur, konsistensi matematis, dan studi kasus riil.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 350000,
      discountPrice: 299000,
      level: "INTERMEDIATE",
      duration: 270,
      totalLessons: 8,
      published: true,
      featured: true,
      categoryId: categories[2].id,
      instructorId: drAminoto.id,
    },
  });

  // Course 3: MCDM Using ISM
  await prisma.course.upsert({
    where: { slug: "mcdm-using-ism" },
    update: {
      title: "MCDM Using ISM (Interpretive Structural Modeling) untuk Kebijakan & Strategi",
      titleEn: "MCDM Using ISM for Policy and Strategic Modeling",
      description: "Pelajari metodologi Interpretive Structural Modeling (ISM) untuk menganalisis dan memetakan hierarki hubungan kontekstual antar variabel kompleks dalam perumusan kebijakan publik, strategi UMKM, dan riset ilmiah.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      price: 350000,
      discountPrice: 299000,
      level: "ADVANCED",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: true,
      categoryId: categories[2].id,
      instructorId: drGatot.id,
    },
    create: {
      slug: "mcdm-using-ism",
      title: "MCDM Using ISM (Interpretive Structural Modeling) untuk Kebijakan & Strategi",
      titleEn: "MCDM Using ISM for Policy and Strategic Modeling",
      description: "Pelajari metodologi Interpretive Structural Modeling (ISM) untuk menganalisis dan memetakan hierarki hubungan kontekstual antar variabel kompleks dalam perumusan kebijakan publik, strategi UMKM, dan riset ilmiah.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      price: 350000,
      discountPrice: 299000,
      level: "ADVANCED",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: true,
      categoryId: categories[2].id,
      instructorId: drGatot.id,
    },
  });

  // Course 4: Social Media Marketing UMKM
  await prisma.course.upsert({
    where: { slug: "social-media-marketing-umkm" },
    update: {
      title: "Social Media Marketing: Optimalisasi Instagram & TikTok untuk UMKM",
      titleEn: "Social Media Marketing: Instagram & TikTok for SMEs",
      description: "Panduan taktis membuat konten viral, kalender konten bulanan, optimalisasi algoritma Meta & TikTok, serta implementasi foto/video produk profesional menggunakan ponsel pintar.",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      price: 250000,
      discountPrice: 199000,
      level: "BEGINNER",
      duration: 280,
      totalLessons: 9,
      published: true,
      featured: true,
      categoryId: categories[1].id,
      instructorId: drGatot.id,
    },
    create: {
      slug: "social-media-marketing-umkm",
      title: "Social Media Marketing: Optimalisasi Instagram & TikTok untuk UMKM",
      titleEn: "Social Media Marketing: Instagram & TikTok for SMEs",
      description: "Panduan taktis membuat konten viral, kalender konten bulanan, optimalisasi algoritma Meta & TikTok, serta implementasi foto/video produk profesional menggunakan ponsel pintar.",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      price: 250000,
      discountPrice: 199000,
      level: "BEGINNER",
      duration: 280,
      totalLessons: 9,
      published: true,
      featured: true,
      categoryId: categories[1].id,
      instructorId: drGatot.id,
    },
  });

  // Course 5: Business Forecasting & SWOT
  await prisma.course.upsert({
    where: { slug: "business-forecasting-swot" },
    update: {
      title: "Business Forecasting Analysis & SWOT Analysis Terapan",
      titleEn: "Applied Business Forecasting & SWOT Analysis",
      description: "Analisis peramalan bisnis, proyeksi penjualan, dan formulasi strategi SWOT berbasis data riil pasar Indonesia untuk memitigasi risiko bisnis dan meningkatkan akurasi keputusan investasi.",
      thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
      price: 275000,
      discountPrice: 225000,
      level: "INTERMEDIATE",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: false,
      categoryId: categories[3].id,
      instructorId: drLovita.id,
    },
    create: {
      slug: "business-forecasting-swot",
      title: "Business Forecasting Analysis & SWOT Analysis Terapan",
      titleEn: "Applied Business Forecasting & SWOT Analysis",
      description: "Analisis peramalan bisnis, proyeksi penjualan, dan formulasi strategi SWOT berbasis data riil pasar Indonesia untuk memitigasi risiko bisnis dan meningkatkan akurasi keputusan investasi.",
      thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
      price: 275000,
      discountPrice: 225000,
      level: "INTERMEDIATE",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: false,
      categoryId: categories[3].id,
      instructorId: drLovita.id,
    },
  });

  // Course 6: Innovation Management & Design Thinking
  await prisma.course.upsert({
    where: { slug: "innovation-management-design-thinking" },
    update: {
      title: "Innovation Management & Design Thinking untuk Bisnis dan Pendidikan",
      titleEn: "Innovation Management & Design Thinking for Business & Education",
      description: "Pelatihan kerangka kerja inovasi terstruktur untuk memvalidasi ide produk baru, memahami empati pelanggan, dan memecahkan hambatan operasional UMKM maupun institusi pendidikan.",
      thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
      price: 250000,
      discountPrice: 199000,
      level: "BEGINNER",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: false,
      categoryId: categories[4].id,
      instructorId: erikHermawan.id,
    },
    create: {
      slug: "innovation-management-design-thinking",
      title: "Innovation Management & Design Thinking untuk Bisnis dan Pendidikan",
      titleEn: "Innovation Management & Design Thinking for Business & Education",
      description: "Pelatihan kerangka kerja inovasi terstruktur untuk memvalidasi ide produk baru, memahami empati pelanggan, dan memecahkan hambatan operasional UMKM maupun institusi pendidikan.",
      thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
      price: 250000,
      discountPrice: 199000,
      level: "BEGINNER",
      duration: 240,
      totalLessons: 8,
      published: true,
      featured: false,
      categoryId: categories[4].id,
      instructorId: erikHermawan.id,
    },
  });

  console.log(`✅ Real Matoh Technologies courses seeded successfully!`);
  console.log("\n📋 Kredensial Login Utama:");
  console.log("   Admin:       admin@matohtechnologies.com / Admin@123456");
  console.log("   Admin Alt:   admin@earthyacademy.com     / Admin@123456");
  console.log("   Instruktur:  gatot@matohtechnologies.com / Matoh@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
