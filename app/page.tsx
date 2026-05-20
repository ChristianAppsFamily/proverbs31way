"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

const colors = {
  base: "#FAFAF8",
  rose: "#D4847A",
  sage: "#6B9E8F",
  text: "#1C1C1A",
  surface: "#F2F0EB",
  border: "#E2DDD6",
  muted: "#6B6B68",
} as const;

type WaitlistStatus = "idle" | "loading" | "success" | "error";

function WaitlistCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    const { data, error } = await supabase.functions.invoke("join-waitlist", {
      body: { email: trimmed },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      return;
    }

    const payload = data as { success?: boolean; error?: string } | null;
    if (payload?.error) {
      setStatus("error");
      setErrorMessage(payload.error);
      return;
    }

    if (!payload?.success) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <p
        className="text-xl md:text-2xl leading-relaxed"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: "italic",
          color: colors.text,
        }}
      >
        You are on the list, sister. We will see you soon.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          autoComplete="email"
          className="w-full flex-1 px-6 py-4 text-base outline-none transition-all disabled:opacity-60"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: colors.text,
            backgroundColor: colors.base,
            border: `1px solid ${colors.border}`,
            borderRadius: "9999px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.rose;
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 132, 122, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-8 py-4 text-base font-medium whitespace-nowrap transition-opacity disabled:cursor-not-allowed"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: "#FFFFFF",
            backgroundColor: colors.rose,
            borderRadius: "9999px",
            opacity: status === "loading" ? 0.75 : 1,
          }}
        >
          {status === "loading" ? "Joining..." : "Notify Me"}
        </button>
      </form>

      {status === "error" && errorMessage ? (
        <p
          className="mt-4 text-sm"
          role="alert"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: colors.muted,
          }}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function CommunityScriptureSection() {
  return (
    <section className="w-full py-24 px-6" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-[720px] mx-auto text-center">
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.sage,
            marginBottom: "32px",
          }}
        >
          WHAT THE WORD SAYS ABOUT COMMUNITY
        </p>

        <img
          src="/images/v1-community-ecclesiastes.jpg"
          alt="Three women sitting closely together on a wooden bench in a tulip field, showing support and community."
          className="w-full rounded-2xl object-cover shadow-[0_18px_45px_rgba(28,28,26,0.08)] mb-10 max-h-[280px] sm:max-h-[340px] md:max-h-[400px]"
          width={1024}
          height={682}
          loading="lazy"
          decoding="async"
        />

        <p
          className="text-[24px] md:text-[32px] leading-[1.6]"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic",
            color: colors.text,
          }}
        >
          Two are better than one, because they have a good return for their labor: If either of them
          falls down, one can help the other up.
        </p>

        <div
          className="mx-auto"
          style={{
            width: "48px",
            height: "1px",
            backgroundColor: colors.rose,
            marginTop: "24px",
            marginBottom: "24px",
          }}
          aria-hidden
        />

        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.sage,
          }}
        >
          ECCLESIASTES 4:9–10
        </p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] flex flex-col w-full">
      <section
        id="waitlist"
        className="flex flex-1 items-center justify-center px-6 py-24 w-full"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="w-full max-w-2xl text-center">
          <p
            className="text-[11px] font-medium tracking-[0.14em] uppercase mb-4"
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: colors.sage,
            }}
          >
            The doors open soon
          </p>
          <h1
            className="text-4xl md:text-5xl font-medium leading-tight mb-5"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              color: colors.text,
            }}
          >
            Your sisters are waiting.
          </h1>
          <p
            className="text-lg mb-10 max-w-md mx-auto"
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: colors.muted,
            }}
          >
            Enter your email to join the waitlist and be among the first Founding Sisters.
          </p>
          <WaitlistCapture />
        </div>
      </section>
      <CommunityScriptureSection />
    </main>
  );
}
