"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoginSchema, SignUpSchema } from "@/lib/security/validation";

/**
 * Maps auth-server error strings (English, from better-auth/Neon) to
 * Vietnamese copy shown in the inline form error. Credential errors stay
 * deliberately generic — we never reveal which field failed.
 */
function localizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (/invalid (email|login|credential)|invalid email or password/.test(m)) {
    return "Email hoặc mật khẩu không đúng.";
  }
  if (
    /already (registered|exists|in use)|email.*(in use|registered|taken)/.test(
      m,
    )
  ) {
    return "Email này đã được đăng ký. Hãy đăng nhập.";
  }
  if (/too many|rate limit/.test(m)) {
    return "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
  }
  if (/not found|no user/.test(m)) {
    return "Không tìm thấy tài khoản với email này.";
  }
  return "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/discover";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [formError, setFormError] = useState("");

  const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`;

  const signInWithGoogle = async () => {
    setPending("google");
    setFormError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (error) {
      setPending(null);
      setFormError(localizeAuthError(error.message) || error.message);
    }
    // On success the browser navigates away — no state update needed.
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const schema = mode === "login" ? LoginSchema : SignUpSchema;
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
      return;
    }

    setPending("email");
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      });
      setPending(null);
      if (error) {
        setFormError(localizeAuthError(error.message) || error.message);
        return;
      }
      toast.success("Đã tạo tài khoản. Kiểm tra email để xác nhận.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(null);
    if (error) {
      setFormError(localizeAuthError(error.message) || error.message);
      return;
    }
    router.push(
      next.startsWith("/") && !next.startsWith("//") ? next : "/discover",
    );
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Học tiếng Anh qua video bạn tự chọn — miễn phí.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending !== null}
        onClick={signInWithGoogle}
      >
        {pending === "google" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Tiếp tục với Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">hoặc</span>
        </div>
      </div>

      <form onSubmit={submitEmail} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="ban@example.com"
            />
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Mật khẩu</span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
        </label>

        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending !== null}>
          {pending === "email" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {mode === "login" ? "Đăng nhập bằng Email" : "Tạo tài khoản"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setFormError("");
          }}
        >
          {mode === "login" ? "Đăng ký" : "Đăng nhập"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← AtoEnglish
      </Link>
      <Suspense
        fallback={
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
