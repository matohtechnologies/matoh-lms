"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setUserLocale(locale: "id" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
