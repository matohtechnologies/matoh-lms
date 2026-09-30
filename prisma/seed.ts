import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { name: "Web Development", nameEn: "Web Development", slug: "web-development", icon: "💻" },
    }),
    prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: { name: "Data Science", nameEn: "Data Science", slug: "data-science", icon: "📊" },
    }),
    prisma.category.upsert({
      where: { slug: "uiux-design" },
      update: {},
      create: { name: "UI/UX Design", nameEn: "UI/UX Design", slug: "uiux-design", icon: "🎨" },
    }),
    prisma.category.upsert({
      where: { slug: "mobile-dev" },
      update: {},
      create: { name: "Mobile Dev", nameEn: "Mobile Development", slug: "mobile-dev", icon: "📱" },
    }),
    prisma.category.upsert({
      where: { slug: "digital-marketing" },
      update: {},
      create: { name: "Digital Marketing", nameEn: "Digital Marketing", slug: "digital-marketing", icon: "📣" },
    }),
    prisma.category.upsert({
      where: { slug: "cloud-computing" },
      update: {},
      create: { name: "Cloud Computing", nameEn: "Cloud Computing", slug: "cloud-computing", icon: "☁️" },
    }),
  ]);

  console.log(`✅ ${categories.length} categories created`);

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@earthyacademy.com" },
    update: {},
    create: {
      name: "Admin Earthy Academy",
      email: "admin@earthyacademy.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create instructor users
  const instructorPassword = await bcrypt.hash("Instructor@123", 12);
  const instructors = await Promise.all([
    prisma.user.upsert({
      where: { email: "ahmad@earthyacademy.com" },
      update: {},
      create: {
        name: "Ahmad Fadhil",
        email: "ahmad@earthyacademy.com",
        password: instructorPassword,
        role: "INSTRUCTOR",
        bio: "Senior Frontend Developer dengan 8 tahun pengalaman. Pernah bekerja di Tokopedia dan Gojek.",
      },
    }),
    prisma.user.upsert({
      where: { email: "sarah@earthyacademy.com" },
      update: {},
      create: {
        name: "Sarah Kusuma",
        email: "sarah@earthyacademy.com",
        password: instructorPassword,
        role: "INSTRUCTOR",
        bio: "UI/UX Designer berpengalaman dengan portofolio di 50+ produk digital.",
      },
    }),
    prisma.user.upsert({
      where: { email: "budi@earthyacademy.com" },
      update: {},
      create: {
        name: "Dr. Budi Santoso",
        email: "budi@earthyacademy.com",
        password: instructorPassword,
        role: "INSTRUCTOR",
        bio: "Data Scientist dengan PhD dari ITB. Expert dalam Machine Learning dan AI.",
      },
    }),
  ]);

  // Create demo user
  const userPassword = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@earthyacademy.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@earthyacademy.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log(`✅ Users created: admin, ${instructors.length} instructors, 1 demo user`);

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { slug: "react-js-modern" },
    update: {},
    create: {
      slug: "react-js-modern",
      title: "React.js Modern Development: Dari Nol ke Expert",
      titleEn: "React.js Modern Development: From Zero to Expert",
      description: "Pelajari React.js dari fundamental hingga advanced concepts. Kamu akan membangun aplikasi nyata menggunakan React 18, TypeScript, Next.js, dan berbagai library terpopuler yang digunakan di industri.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      price: 299000,
      discountPrice: 199000,
      level: "BEGINNER",
      totalLessons: 84,
      duration: 1240,
      published: true,
      featured: true,
      rating: 4.9,
      reviewCount: 1240,
      enrollCount: 8432,
      categoryId: categories[0].id,
      instructorId: instructors[0].id,
    },
  });

  // Add sections & lessons to course 1
  const section1 = await prisma.section.upsert({
    where: { id: "section-1" },
    update: {},
    create: {
      id: "section-1",
      title: "Pengenalan & Setup",
      titleEn: "Introduction & Setup",
      order: 1,
      courseId: course1.id,
    },
  });

  await prisma.lesson.upsert({
    where: { sectionId_slug: { sectionId: section1.id, slug: "welcome-overview" } },
    update: {},
    create: {
      slug: "welcome-overview",
      title: "Welcome & Overview Kelas",
      duration: 5,
      isFree: true,
      order: 1,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      sectionId: section1.id,
    },
  });

  await prisma.lesson.upsert({
    where: { sectionId_slug: { sectionId: section1.id, slug: "instalasi-tools" } },
    update: {},
    create: {
      slug: "instalasi-tools",
      title: "Instalasi Node.js & Tools",
      duration: 12,
      isFree: false,
      order: 2,
      sectionId: section1.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "uiux-design-masterclass" },
    update: {},
    create: {
      slug: "uiux-design-masterclass",
      title: "UI/UX Design Masterclass: Figma & Design Thinking",
      description: "Kuasai UI/UX Design dari nol. Pelajari design thinking, wireframing, prototyping, dan cara membuat desain yang user-centered menggunakan Figma.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      price: 0,
      level: "BEGINNER",
      totalLessons: 48,
      duration: 720,
      published: true,
      featured: true,
      rating: 4.7,
      reviewCount: 643,
      enrollCount: 12800,
      categoryId: categories[2].id,
      instructorId: instructors[1].id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "python-data-science" },
    update: {},
    create: {
      slug: "python-data-science",
      title: "Python for Data Science & Machine Learning",
      description: "Pelajari Python untuk analisis data dan machine learning. Dari pandas, numpy, matplotlib hingga scikit-learn dan TensorFlow.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 349000,
      level: "INTERMEDIATE",
      totalLessons: 96,
      duration: 1680,
      published: true,
      featured: true,
      rating: 4.8,
      reviewCount: 892,
      enrollCount: 5210,
      categoryId: categories[1].id,
      instructorId: instructors[2].id,
    },
  });

  console.log(`✅ Courses created`);

  // Enroll demo user in free course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demoUser.id, courseId: course2.id } },
    update: {},
    create: { userId: demoUser.id, courseId: course2.id },
  });

  console.log("✅ Demo enrollment created");
  console.log("\n🎉 Seed completed!");
  console.log("\n📋 Akun yang dibuat:");
  console.log("   Admin:       admin@earthyacademy.com   / Admin@123456");
  console.log("   Instruktur:  ahmad@earthyacademy.com   / Instructor@123");
  console.log("   User Demo:   user@earthyacademy.com    / User@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
