"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadLangConfig } from "@/lib/i18n/index";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const config = loadLangConfig();
    if (config) {
      router.replace("/world");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--hy-orange)" }} />
        <p className="text-white/30 text-sm">NUR Lingo...</p>
      </div>
    </div>
  );
}
