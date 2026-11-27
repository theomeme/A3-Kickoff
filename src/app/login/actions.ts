"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function enviarLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?erro=email");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) redirect("/login?erro=envio");
  redirect("/login?enviado=1");
}
