import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper to format Date into YYYY-MM-DD in Asia/Jakarta timezone (+7)
function toDateKey(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // outputs "YYYY-MM-DD"
}

// Helper to shift a date by N days
function shiftDays(dateStr: string, diffDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + diffDays);
  return date.toISOString().slice(0, 10);
}

// Day name short in Indonesian
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's timestamps across learning activities:
    // 1. Completed lessons
    const progressRecords = await prisma.progress.findMany({
      where: { userId },
      select: { completedAt: true },
    });

    // 2. Quiz attempts
    const quizRecords = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { createdAt: true },
    });

    // 3. Assignment submissions
    const submissionRecords = await prisma.userSubmission.findMany({
      where: { userId },
      select: { submittedAt: true },
    });

    // Collect all unique activity dates (YYYY-MM-DD)
    const activeDatesSet = new Set<string>();

    for (const p of progressRecords) {
      if (p.completedAt) activeDatesSet.add(toDateKey(p.completedAt));
    }
    for (const q of quizRecords) {
      if (q.createdAt) activeDatesSet.add(toDateKey(q.createdAt));
    }
    for (const s of submissionRecords) {
      if (s.submittedAt) activeDatesSet.add(toDateKey(s.submittedAt));
    }

    const todayKey = toDateKey(new Date());
    const yesterdayKey = shiftDays(todayKey, -1);
    const todayCompleted = activeDatesSet.has(todayKey);

    // Sort unique dates descending
    const sortedDates = Array.from(activeDatesSet).sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    if (todayCompleted) {
      currentStreak = 1;
      let checkDate = yesterdayKey;
      while (activeDatesSet.has(checkDate)) {
        currentStreak++;
        checkDate = shiftDays(checkDate, -1);
      }
    } else if (activeDatesSet.has(yesterdayKey)) {
      // Grace period: today is not yet done, but yesterday was! Streak is alive
      currentStreak = 1;
      let checkDate = shiftDays(yesterdayKey, -1);
      while (activeDatesSet.has(checkDate)) {
        currentStreak++;
        checkDate = shiftDays(checkDate, -1);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    // Iterate from oldest to newest
    const ascDates = Array.from(activeDatesSet).sort();
    for (let i = 0; i < ascDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = ascDates[i - 1];
        const curr = ascDates[i];
        if (shiftDays(prev, 1) === curr) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // Build last 7 days history array (from 6 days ago up to today)
    const history: Array<{
      date: string;
      dayName: string;
      completed: boolean;
      isToday: boolean;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const dKey = shiftDays(todayKey, -i);
      const [y, m, d] = dKey.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      const dayName = DAY_NAMES[dt.getUTCDay()];
      history.push({
        date: dKey,
        dayName,
        completed: activeDatesSet.has(dKey),
        isToday: dKey === todayKey,
      });
    }

    // Dynamic motivational message
    let message = "Mulai belajar hari ini untuk menyalakan api streak belajarmu! 🔥";
    if (currentStreak > 0) {
      if (todayCompleted) {
        message = `Luar biasa! Kamu telah belajar hari ini. Api belajarmu menyala ${currentStreak} hari beruntun! 🔥`;
      } else {
        message = `Streak ${currentStreak} hari aktif! Selesaikan 1 materi hari ini agar apimu tidak padam.`;
      }
    }

    return NextResponse.json({
      streakCount: currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      todayCompleted,
      totalActiveDays: activeDatesSet.size,
      lastActiveDate: sortedDates[0] || null,
      history,
      message,
    });
  } catch (error) {
    console.error("Streak calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
